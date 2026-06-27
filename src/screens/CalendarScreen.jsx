import { useState } from 'react'
import DateInput from '../components/DateInput'

const HEBREW_DAYS = ['יום א׳', 'יום ב׳', 'יום ג׳', 'יום ד׳', 'יום ה׳', 'יום ו׳', 'שבת']

function formatILDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

function monthYearLabel(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
}

function TimeInput({ value, onChange }) {
  return (
    <div style={{ flex: 1 }}>
      <input className="input" placeholder="שעה (16:30)" value={value}
        onChange={e => {
          const v = e.target.value.replace(/[^0-9:]/g, '')
          if (v.length === 2 && !v.includes(':') && value.length < 2) onChange(v + ':')
          else onChange(v.slice(0, 5))
        }} inputMode="numeric" maxLength={5} style={{ width: '100%' }} />
    </div>
  )
}

export default function CalendarScreen({ data, add, update, remove }) {
  const { events } = data
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [eeTitle, setEeTitle] = useState('')
  const [eeDate, setEeDate] = useState('')
  const [eeTime, setEeTime] = useState('')
  const [eeLocation, setEeLocation] = useState('')
  const [eeNotes, setEeNotes] = useState('')

  function addEvent(e) {
    e.preventDefault()
    if (!title.trim() || !date) return
    add('events', { title: title.trim(), date, time, location: location.trim(), notes: notes.trim() })
    setTitle(''); setDate(''); setTime(''); setLocation(''); setNotes('')
  }

  function startEdit(ev) {
    setEditingId(ev.id)
    setEeTitle(ev.title || '')
    setEeDate(ev.date || '')
    setEeTime(ev.time || '')
    setEeLocation(ev.location || '')
    setEeNotes(ev.notes || '')
  }

  function saveEdit(id) {
    if (!eeTitle.trim() || !eeDate) return
    update('events', id, { title: eeTitle.trim(), date: eeDate, time: eeTime, location: eeLocation.trim(), notes: eeNotes.trim() })
    setEditingId(null)
  }

  const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date))

  const grouped = sorted.reduce((acc, ev) => {
    const d = new Date(ev.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const label = monthYearLabel(ev.date)
    if (!acc[key]) acc[key] = { label, events: [] }
    acc[key].events.push(ev)
    return acc
  }, {})

  return (
    <>
      <div className="page-header">
        <h1>📅 לוח זמנים</h1>
      </div>

      <div className="card">
        <div className="card-title">הוסף אירוע ➕</div>
        <form onSubmit={addEvent}>
          <div className="input-group">
            <input className="input" placeholder="שם האירוע" value={title}
              onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="input-row">
            <DateInput className="input" value={date} onChange={setDate} />
            <TimeInput value={time} onChange={setTime} />
          </div>
          <div className="input-group">
            <input className="input" placeholder="מיקום (אופציונלי)" value={location}
              onChange={e => setLocation(e.target.value)} />
          </div>
          <div className="input-group">
            <input className="input" placeholder="הערות (אופציונלי)" value={notes}
              onChange={e => setNotes(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">הוסף אירוע</button>
        </form>
      </div>

      {sorted.length === 0 ? (
        <div className="card">
          <p className="empty-state">אין אירועים מתוכננים</p>
        </div>
      ) : (
        Object.values(grouped).map(group => (
          <div key={group.label}>
            <div className="section-divider">{group.label}</div>
            <div className="card">
              {group.events.map(ev => {
                if (editingId === ev.id) {
                  return (
                    <div key={ev.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div className="input-group" style={{ marginBottom: 8 }}>
                        <input className="input" value={eeTitle} onChange={e => setEeTitle(e.target.value)} />
                      </div>
                      <div className="input-row" style={{ marginBottom: 8 }}>
                        <DateInput className="input" value={eeDate} onChange={setEeDate} />
                        <TimeInput value={eeTime} onChange={setEeTime} />
                      </div>
                      <div className="input-group" style={{ marginBottom: 8 }}>
                        <input className="input" placeholder="מיקום" value={eeLocation} onChange={e => setEeLocation(e.target.value)} />
                      </div>
                      <div className="input-group" style={{ marginBottom: 8 }}>
                        <input className="input" placeholder="הערות" value={eeNotes} onChange={e => setEeNotes(e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={() => saveEdit(ev.id)} style={{ padding: '6px 16px', fontSize: 13 }}>שמור</button>
                        <button className="btn btn-outline" onClick={() => setEditingId(null)} style={{ padding: '6px 16px', fontSize: 13 }}>ביטול</button>
                      </div>
                    </div>
                  )
                }
                const d = new Date(ev.date)
                const dayName = HEBREW_DAYS[d.getDay()]
                return (
                  <div key={ev.id} className="event-item" onClick={() => startEdit(ev)} style={{ cursor: 'pointer' }}>
                    <div className="event-date-block">
                      <div className="event-day">{d.getDate()}</div>
                      <div className="event-month">{dayName}</div>
                    </div>
                    <div className="event-body">
                      <div className="event-title">{ev.title}</div>
                      <div className="event-time">
                        {ev.time && `${ev.time}`}{ev.location && ` • ${ev.location}`}
                        {' '}<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatILDate(ev.date)}</span>
                      </div>
                      {ev.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{ev.notes}</div>}
                    </div>
                    <button className="event-delete" onClick={e => { e.stopPropagation(); remove('events', ev.id) }}>✕</button>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </>
  )
}
