import { useState, useEffect } from 'react'

const DEFAULT_ROOMS = ['מטבח', 'סלון', 'חדר שינה', 'חדר אמבטיה', 'מחסן', 'משרד']

function firstName(fullName) {
  return (fullName || '').split(' ')[0] || '?'
}

export default function Packing({ data, add, update, remove, saveMeta, members }) {
  const { boxes } = data
  const [boxRoom, setBoxRoom] = useState('')
  const [boxDesc, setBoxDesc] = useState('')
  const [boxFragile, setBoxFragile] = useState(false)
  const [boxOwner, setBoxOwner] = useState('all')
  const [filterRoom, setFilterRoom] = useState('all')
  const [filterOwner, setFilterOwner] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editRoom, setEditRoom] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editFragile, setEditFragile] = useState(false)
  const [editOwner, setEditOwner] = useState('all')
  const [customRooms, setCustomRooms] = useState([])

  const memberEntries = Object.entries(members)

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

  function addBox(e) {
    e.preventDefault()
    if (!boxRoom.trim()) return
    saveRoom(boxRoom.trim())
    add('boxes', {
      number: String(nextNumber),
      room: boxRoom.trim(),
      description: boxDesc.trim(),
      fragile: boxFragile,
      owner: boxOwner,
    })
    setBoxDesc('')
    setBoxFragile(false)
  }

  function startEdit(b) {
    setEditingId(b.id)
    setEditRoom(b.room || '')
    setEditDesc(b.description || '')
    setEditFragile(b.fragile || false)
    setEditOwner(b.owner || 'all')
  }

  function saveEdit(id) {
    if (!editRoom.trim()) return
    saveRoom(editRoom.trim())
    update('boxes', id, {
      room: editRoom.trim(),
      description: editDesc.trim(),
      fragile: editFragile,
      owner: editOwner,
    })
    setEditingId(null)
  }

  let filtered = [...boxes]
  if (filterRoom !== 'all') filtered = filtered.filter(b => b.room === filterRoom)
  if (filterOwner !== 'all') filtered = filtered.filter(b => b.owner === filterOwner)
  const sorted = filtered.sort((a, b) => Number(a.number) - Number(b.number))

  const roomCounts = boxes.reduce((acc, b) => { acc[b.room] = (acc[b.room] || 0) + 1; return acc }, {})

  return (
    <>
      <div className="page-header">
        <h1>📦 אריזה</h1>
      </div>

      {/* Add box */}
      <div className="card">
        <div className="card-title">הוסף ארגז #{nextNumber} ➕</div>
        <form onSubmit={addBox}>
          <div className="input-row">
            <input className="input" list="room-list" placeholder="חדר" value={boxRoom}
              onChange={e => setBoxRoom(e.target.value)} />
            <datalist id="room-list">
              {allRooms.map(r => <option key={r} value={r} />)}
            </datalist>
            {memberEntries.length > 1 && (
              <select className="input" value={boxOwner} onChange={e => setBoxOwner(e.target.value)}>
                <option value="all">כולם</option>
                {memberEntries.map(([uid, name]) => (
                  <option key={uid} value={uid}>{firstName(name)}</option>
                ))}
              </select>
            )}
          </div>
          <div className="input-group">
            <input className="input" placeholder="תיאור תוכן" value={boxDesc}
              onChange={e => setBoxDesc(e.target.value)} />
          </div>
          <div className="checkbox-row" style={{ marginBottom: 10 }}>
            <input type="checkbox" id="fragile" checked={boxFragile}
              onChange={e => setBoxFragile(e.target.checked)} />
            <label htmlFor="fragile">⚠️ שביר</label>
          </div>
          <button type="submit" className="btn btn-primary">הוסף ארגז</button>
        </form>
      </div>

      {/* Filters */}
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

      {/* Box list */}
      {sorted.length > 0 && (
        <div className="card">
          <div className="card-title">ארגזים ({sorted.length})</div>
          {sorted.map(b => {
            const ownerName = b.owner === 'all' ? '' : members[b.owner] ? firstName(members[b.owner]) : ''

            if (editingId === b.id) {
              return (
                <div key={b.id} className="box-item" style={{ flexWrap: 'wrap', gap: 8, padding: '12px 0' }}>
                  <div className="box-num">#{b.number}</div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="input-row" style={{ margin: 0 }}>
                      <input className="input" list="room-list-edit" value={editRoom}
                        placeholder="חדר" onChange={e => setEditRoom(e.target.value)} />
                      <datalist id="room-list-edit">
                        {allRooms.map(r => <option key={r} value={r} />)}
                      </datalist>
                      {memberEntries.length > 1 && (
                        <select className="input" value={editOwner} onChange={e => setEditOwner(e.target.value)}>
                          <option value="all">כולם</option>
                          {memberEntries.map(([uid, name]) => (
                            <option key={uid} value={uid}>{firstName(name)}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <input className="input" placeholder="תיאור תוכן" value={editDesc}
                      onChange={e => setEditDesc(e.target.value)} style={{ margin: 0 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="checkbox-row" style={{ margin: 0, flex: 1 }}>
                        <input type="checkbox" id={`edit-fragile-${b.id}`} checked={editFragile}
                          onChange={e => setEditFragile(e.target.checked)} />
                        <label htmlFor={`edit-fragile-${b.id}`}>⚠️ שביר</label>
                      </div>
                      <button className="btn btn-primary" onClick={() => saveEdit(b.id)}
                        style={{ padding: '6px 16px', fontSize: 13 }}>שמור</button>
                      <button className="btn btn-outline" onClick={() => setEditingId(null)}
                        style={{ padding: '6px 16px', fontSize: 13 }}>ביטול</button>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div key={b.id} className="box-item" onClick={() => startEdit(b)} style={{ cursor: 'pointer' }}>
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

      {/* Stats */}
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
    </>
  )
}
