import { useState } from 'react'
import { getCalendarToken, pushEventsToGoogleCalendar } from '../firebase'
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

function shortMonth(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('he-IL', { month: 'short' })
}

export default function CalendarScreen({ data, add, remove }) {
  const { events } = data
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState(null)

  async function syncToGoogle() {
    if (events.length === 0) return
    setSyncing(true)
    setSyncMsg(null)
    try {
      const token = await getCalendarToken()
      if (!token) {
        setSyncMsg({ ok: false, text: 'לא הצלחנו לקבל הרשאה ליומן Google' })
        setSyncing(false)
        return
      }
      const results = await pushEventsToGoogleCalendar(token, events)
      const ok = results.filter(r => r.ok).length
      const failed = results.filter(r => !r.ok).length
      if (failed === 0) {
        setSyncMsg({ ok: true, text: `${ok} אירועים סונכרנו ליומן Google` })
      } else {
        setSyncMsg({ ok: false, text: `${ok} הצליחו, ${failed} נכשלו` })
      }
    } catch (err) {
      console.error('Calendar sync failed:', err)
      setSyncMsg({ ok: false, text: 'שגיאה בסנכרון. ודא שהפעלת את Google Calendar API' })
    }
    setSyncing(false)
  }

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

      {/* Google Calendar sync */}
      {events.length > 0 && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={syncToGoogle} disabled={syncing}
            style={{ flex: '0 0 auto' }}>
            {syncing ? 'מסנכרן...' : '🔄 סנכרן ל-Google Calendar'}
          </button>
          {syncMsg && (
            <span style={{ fontSize: 13, color: syncMsg.ok ? 'var(--success)' : 'var(--urgent)' }}>
              {syncMsg.text}
            </span>
          )}
        </div>
      )}

      {/* Add event */}
      <div className="card">
        <div className="card-title">הוסף אירוע ➕</div>
        <form onSubmit={addEvent}>
          <div className="input-group">
            <input className="input" placeholder="שם האירוע" value={title}
              onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="input-row">
            <DateInput className="input" value={date} onChange={setDate} />
            <input className="input" placeholder="שעה (16:30)" value={time}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9:]/g, '')
                if (v.length === 2 && !v.includes(':') && time.length < 2) setTime(v + ':')
                else setTime(v.slice(0, 5))
              }} inputMode="numeric" maxLength={5} />
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
                const dayName = HEBREW_DAYS[d.getDay()]
                return (
                  <div key={ev.id} className="event-item">
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
