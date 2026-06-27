import { useState } from 'react'

function daysUntil(dateStr) {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  return diff
}

const HEBREW_MONTHS = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ']

export default function Dashboard({ data, saveMeta }) {
  const { tasks, settings, events } = data
  const [dateInput, setDateInput] = useState(settings.moveDate || '')

  const days = daysUntil(settings.moveDate)
  const total = tasks.length
  const done = tasks.filter(t => t.done).length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const urgent = tasks.filter(t => !t.done && t.dueDate && daysUntil(t.dueDate) <= 7 && daysUntil(t.dueDate) >= 0)

  // Upcoming events (next 7 days)
  const upcomingEvents = events
    .filter(e => {
      const d = daysUntil(e.date?.split('T')[0])
      return d !== null && d >= 0 && d <= 14
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3)

  function saveDate(val) {
    setDateInput(val)
    saveMeta('settings', { moveDate: val })
  }

  return (
    <>
      <div className="page-header">
        <h1>🏠 ניהול מעבר דירה</h1>
      </div>

      {/* Countdown */}
      <div className="card">
        <div className="card-title">ספירה לאחור ⏱️</div>
        {days !== null ? (
          <div className="countdown-display">
            <div className="countdown-number">{Math.abs(days)}</div>
            <div className="countdown-label">
              {days > 0 ? `ימים עד המעבר` : days === 0 ? 'יום המעבר!' : 'ימים אחרי המעבר'}
            </div>
          </div>
        ) : (
          <p className="empty-state">הגדר תאריך מעבר</p>
        )}
        <div className="input-group" style={{ marginTop: 12 }}>
          <label className="input-label">תאריך מעבר</label>
          <input
            type="date"
            className="input"
            value={dateInput}
            onChange={e => saveDate(e.target.value)}
          />
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="card-title">התקדמות כללית 📊</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-label">{pct}% הושלם ({done}/{total} משימות)</div>
      </div>

      {/* Urgent tasks */}
      <div className="card">
        <div className="card-title">משימות דחופות 🔥</div>
        {urgent.length === 0 ? (
          <p className="empty-state">🎉 אין משימות דחופות</p>
        ) : (
          urgent.map(t => (
            <div key={t.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <strong>{t.name}</strong>
              <span style={{ color: 'var(--urgent)', marginRight: 8, fontSize: 12 }}>
                {daysUntil(t.dueDate) === 0 ? 'היום!' : `עוד ${daysUntil(t.dueDate)} ימים`}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="card">
          <div className="card-title">אירועים קרובים 📅</div>
          {upcomingEvents.map(e => {
            const d = new Date(e.date)
            return (
              <div key={e.id} className="event-item">
                <div className="event-date-block">
                  <div className="event-day">{d.getDate()}</div>
                  <div className="event-month">{HEBREW_MONTHS[d.getMonth()]}</div>
                </div>
                <div className="event-body">
                  <div className="event-title">{e.title}</div>
                  {e.time && <div className="event-time">{e.time}{e.location ? ` • ${e.location}` : ''}</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
