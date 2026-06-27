import { useState } from 'react'

const HEBREW_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const HEBREW_MONTHS_SHORT = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ']

function formatEventDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getDate()} ב${HEBREW_MONTHS[d.getMonth()]}`
}

export default function CalendarScreen({ data, add, remove }) {
  const { events } = data
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  function addEvent(e) {
    e.preventDefault()
    if (!title.trim() || !date) return
    add('events', { title: title.trim(), date, time, location: location.trim(), notes: notes.trim() })
    setTitle(''); setDate(''); setTime(''); setLocation(''); setNotes('')
  }

  const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date))

  // Group by month
  const grouped = sorted.reduce((acc, ev) => {
    const d = new Date(ev.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const label = `${HEBREW_MONTHS[d.getMonth()]} ${d.getFullYear()}`
    if (!acc[key]) acc[key] = { label, events: [] }
    acc[key].events.push(ev)
    return acc
  }, {})

  return (
    <>
      <div className="page-header">
        <h1>📅 לוח זמנים</h1>
      </div>

      {/* Add event */}
      <div className="card">
        <div className="card-title">הוסף אירוע ➕</div>
        <form onSubmit={addEvent}>
          <div className="input-group">
            <input className="input" placeholder="שם האירוע" value={title}
              onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="input-row">
            <input type="date" className="input" value={date}
              onChange={e => setDate(e.target.value)} />
            <input type="time" className="input" value={time}
              onChange={e => setTime(e.target.value)} />
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

      {/* Events list */}
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
                const d = new Date(ev.date)
                return (
                  <div key={ev.id} className="event-item">
                    <div className="event-date-block">
                      <div className="event-day">{d.getDate()}</div>
                      <div className="event-month">{HEBREW_MONTHS_SHORT[d.getMonth()]}</div>
                    </div>
                    <div className="event-body">
                      <div className="event-title">{ev.title}</div>
                      <div className="event-time">
                        {ev.time && `${ev.time}`}{ev.location && ` • ${ev.location}`}
                      </div>
                      {ev.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{ev.notes}</div>}
                    </div>
                    <button className="event-delete" onClick={() => remove('events', ev.id)}>✕</button>
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
