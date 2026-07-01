import { useState, useEffect } from 'react'
import FormModal from '../components/FormModal'
import Fab from '../components/Fab'

const DEFAULT_ROOMS = ['מטבח', 'סלון', 'חדר שינה', 'חדר אמבטיה', 'מחסן', 'משרד']

function firstName(fullName) {
  return (fullName || '').split(' ')[0] || '?'
}

export default function Packing({ data, add, update, remove, saveMeta, members, tab }) {
  const { boxes } = data
  const [filterRoom, setFilterRoom] = useState('all')
  const [filterOwner, setFilterOwner] = useState('all')
  const [customRooms, setCustomRooms] = useState([])
  const [modal, setModal] = useState(null)

  const memberEntries = Object.entries(members)
  const setField = (key, val) => setModal(prev => prev ? { ...prev, fields: { ...prev.fields, [key]: val } } : prev)

  useEffect(() => {
    if (data.settings?.customRooms) setCustomRooms(data.settings.customRooms)
  }, [data.settings?.customRooms])

  const usedRooms = [...new Set(boxes.map(b => b.room).filter(Boolean))]
  const allRooms = [...new Set([...DEFAULT_ROOMS, ...customRooms, ...usedRooms])]

  const nextNumber = boxes.length > 0
    ? Math.max(...boxes.map(b => Number(b.number) || 0)) + 1
    : 1

  function saveRoom(room) {
    if (room && !DEFAULT_ROOMS.includes(room) && !customRooms.includes(room)) {
      const updated = [...customRooms, room]
      setCustomRooms(updated)
      saveMeta('settings', { customRooms: updated })
    }
  }

  function openAdd() {
    setModal({ mode: 'add', fields: { number: '', room: '', description: '', fragile: false, owner: 'all' } })
  }

  function openEdit(b) {
    setModal({ mode: 'edit', id: b.id, fields: { number: b.number || '', room: b.room || '', description: b.description || '', fragile: b.fragile || false, owner: b.owner || 'all' } })
  }

  function handleSave() {
    if (!modal) return
    const { number, room, description, fragile, owner } = modal.fields
    if (!room.trim()) return
    saveRoom(room.trim())
    if (modal.mode === 'add') {
      add('boxes', { number: number.trim() || String(nextNumber), room: room.trim(), description: description.trim(), fragile, owner })
    } else {
      update('boxes', modal.id, { number: number.trim() || '0', room: room.trim(), description: description.trim(), fragile, owner })
    }
  }

  let filtered = [...boxes]
  if (filterRoom !== 'all') filtered = filtered.filter(b => b.room === filterRoom)
  if (filterOwner !== 'all') filtered = filtered.filter(b => b.owner === filterOwner)
  const sorted = filtered.sort((a, b) => Number(a.number) - Number(b.number))

  const roomCounts = boxes.reduce((acc, b) => { acc[b.room] = (acc[b.room] || 0) + 1; return acc }, {})

  return (
    <>
      <div className="page-header">
        <p className="page-kicker">מעקב ארגזים</p>
        <h1>אריזה</h1>
      </div>

      <div className="desktop-actions">
        <button className="btn btn-primary" onClick={openAdd}>הוסף ארגז</button>
      </div>

      {boxes.length > 0 && (
        <div className="filter-row" style={{ flexWrap: 'wrap' }}>
          <button className={`filter-pill ${filterRoom === 'all' ? 'active' : ''}`}
            onClick={() => setFilterRoom('all')}>הכל ({boxes.length})</button>
          {Object.entries(roomCounts).sort(([,a],[,b]) => b - a).map(([room, count]) => (
            <button key={room} className={`filter-pill ${filterRoom === room ? 'active' : ''}`}
              onClick={() => setFilterRoom(room)}>
              {room} ({count})
            </button>
          ))}
          {memberEntries.length > 1 && (
            <>
              <span style={{ width: '100%', height: 0 }} />
              <button className={`filter-pill ${filterOwner === 'all' ? 'active' : ''}`}
                onClick={() => setFilterOwner('all')}>כל המשפחה</button>
              {memberEntries.map(([uid, name]) => (
                <button key={uid} className={`filter-pill ${filterOwner === uid ? 'active' : ''}`}
                  onClick={() => setFilterOwner(uid)}>
                  {firstName(name)}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="card">
          <div className="card-title">ארגזים ({sorted.length})</div>
          {sorted.map(b => {
            const ownerName = b.owner === 'all' ? '' : members[b.owner] ? firstName(members[b.owner]) : ''
            return (
              <div key={b.id} className="box-item" onClick={() => openEdit(b)} style={{ cursor: 'pointer' }}>
                <div className="box-num">#{b.number}</div>
                <div className="box-info">
                  <div className="box-desc">
                    {b.description || '(ללא תיאור)'} {b.fragile ? '⚠️' : ''}
                  </div>
                  <div className="box-room">
                    {b.room}{ownerName ? ` · ${ownerName}` : ''}
                  </div>
                </div>
                <button className="task-delete" onClick={e => { e.stopPropagation(); remove('boxes', b.id) }}>✕</button>
              </div>
            )
          })}
        </div>
      )}

      {boxes.length > 0 && (
        <div className="card">
          <div className="card-title">סיכום</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy)' }}>{boxes.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>סה"כ ארגזים</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--urgent)' }}>
                {boxes.filter(b => b.fragile).length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>שבירים</div>
            </div>
            {Object.entries(roomCounts).sort(([,a],[,b]) => b - a).slice(0, 4).map(([room, count]) => (
              <div key={room} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--terra)' }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{room}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Fab onClick={openAdd} pulse={tab} />

      <FormModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        onSave={handleSave}
        title={modal?.mode === 'edit' ? 'עריכת ארגז' : `הוסף ארגז #${nextNumber}`}
        saveLabel={modal?.mode === 'edit' ? 'שמור' : 'הוסף'}
      >
        {modal && (
          <>
            <div className="input-row">
              <input className="input" placeholder={`מס׳ (${nextNumber})`} value={modal.fields.number}
                onChange={e => setField('number', e.target.value)} inputMode="numeric"
                style={{ flex: '0 0 80px' }} />
              <input className="input" list="room-list-modal" placeholder="חדר" value={modal.fields.room}
                onChange={e => setField('room', e.target.value)} />
              <datalist id="room-list-modal">
                {allRooms.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
            {memberEntries.length > 1 && (
              <div className="input-group">
                <select className="input" value={modal.fields.owner} onChange={e => setField('owner', e.target.value)}>
                  <option value="all">כולם</option>
                  {memberEntries.map(([uid, name]) => (
                    <option key={uid} value={uid}>{firstName(name)}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="input-group">
              <input className="input" placeholder="תיאור תוכן" value={modal.fields.description}
                onChange={e => setField('description', e.target.value)} />
            </div>
            <div className="checkbox-row" style={{ marginBottom: 10 }}>
              <input type="checkbox" id="modal-fragile" checked={modal.fields.fragile}
                onChange={e => setField('fragile', e.target.checked)} />
              <label htmlFor="modal-fragile">⚠️ שביר</label>
            </div>
          </>
        )}
      </FormModal>
    </>
  )
}
