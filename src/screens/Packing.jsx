import { useState } from 'react'

const ROOMS = ['מטבח', 'סלון', 'חדר שינה', 'חדר ילדים', 'שירותים/אמבטיה', 'מחסן', 'משרד', 'אחר']

export default function Packing({ data, add, update, remove, saveMeta }) {
  const { boxes, movingCompany } = data

  // Moving company form state
  const mc = movingCompany || {}
  const [mcName, setMcName] = useState(mc.name || '')
  const [mcPhone, setMcPhone] = useState(mc.phone || '')
  const [mcPrice, setMcPrice] = useState(mc.price || '')
  const [mcDate, setMcDate] = useState(mc.date || '')
  const [mcPaid, setMcPaid] = useState(mc.depositPaid || false)

  // Box form state
  const [boxNum, setBoxNum] = useState('')
  const [boxRoom, setBoxRoom] = useState(ROOMS[0])
  const [boxDesc, setBoxDesc] = useState('')
  const [boxFragile, setBoxFragile] = useState(false)

  function saveMc(field, val) {
    const updated = { name: mcName, phone: mcPhone, price: mcPrice, date: mcDate, depositPaid: mcPaid, [field]: val }
    saveMeta('movingCompany', updated)
  }

  function addBox(e) {
    e.preventDefault()
    if (!boxNum.trim() && !boxDesc.trim()) return
    const num = boxNum.trim() || String(boxes.length + 1)
    add('boxes', { number: num, room: boxRoom, description: boxDesc.trim(), fragile: boxFragile })
    setBoxNum(''); setBoxDesc(''); setBoxFragile(false)
  }

  const sortedBoxes = [...boxes].sort((a, b) => Number(a.number) - Number(b.number))

  return (
    <>
      <div className="page-header">
        <h1>📦 ארזה</h1>
      </div>

      {/* Moving company */}
      <div className="card">
        <div className="card-title">פרטי חברת ההובלה 🚛</div>
        <div className="input-group">
          <label className="input-label">שם החברה</label>
          <input className="input" value={mcName} placeholder="שם החברה"
            onChange={e => { setMcName(e.target.value); saveMc('name', e.target.value) }} />
        </div>
        <div className="input-row">
          <div style={{ flex: 1 }}>
            <label className="input-label">טלפון</label>
            <input className="input" value={mcPhone} placeholder="טלפון"
              onChange={e => { setMcPhone(e.target.value); saveMc('phone', e.target.value) }} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="input-label">מחיר מוסכם</label>
            <input className="input" value={mcPrice} placeholder="₪"
              onChange={e => { setMcPrice(e.target.value); saveMc('price', e.target.value) }} />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">תאריך ושעה</label>
          <input type="datetime-local" className="input" value={mcDate}
            onChange={e => { setMcDate(e.target.value); saveMc('date', e.target.value) }} />
        </div>
        <div className="checkbox-row">
          <input type="checkbox" id="deposit" checked={mcPaid}
            onChange={e => { setMcPaid(e.target.checked); saveMc('depositPaid', e.target.checked) }} />
          <label htmlFor="deposit">שולם פיקדון</label>
        </div>
      </div>

      {/* Boxes */}
      <div className="card">
        <div className="card-title">מעקב ארגזים 📦</div>
        {sortedBoxes.length === 0 ? (
          <p className="empty-state">אין ארגזים עדיין</p>
        ) : (
          sortedBoxes.map(b => (
            <div key={b.id} className="box-item">
              <div className="box-num">#{b.number}</div>
              <div className="box-info">
                <div className="box-desc">{b.description || '(ללא תיאור)'} {b.fragile ? '⚠️' : ''}</div>
                <div className="box-room">{b.room}</div>
              </div>
              <button className="task-delete" onClick={() => remove('boxes', b.id)}>✕</button>
            </div>
          ))
        )}

        <div className="section-divider" style={{ marginTop: 12 }}>הוסף ארגז</div>
        <form onSubmit={addBox}>
          <div className="input-row">
            <div style={{ flex: '0 0 90px' }}>
              <input className="input" placeholder="מספר" value={boxNum}
                onChange={e => setBoxNum(e.target.value)} type="number" min="1" />
            </div>
            <select className="input" value={boxRoom} onChange={e => setBoxRoom(e.target.value)}>
              {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
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
            {Object.entries(
              boxes.reduce((acc, b) => { acc[b.room] = (acc[b.room] || 0) + 1; return acc }, {})
            ).sort(([,a],[,b]) => b-a).slice(0, 3).map(([room, count]) => (
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
