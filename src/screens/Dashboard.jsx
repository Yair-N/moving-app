import { useState, useEffect } from 'react'
import DateInput from '../components/DateInput'

function daysUntil(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

const HEBREW_DAYS = ['יום א׳', 'יום ב׳', 'יום ג׳', 'יום ד׳', 'יום ה׳', 'יום ו׳', 'שבת']

export default function Dashboard({ data, saveMeta, members, switchTab }) {
  const { tasks, settings, events, contacts } = data
  const [dateInput, setDateInput] = useState(settings.moveDate || '')

  useEffect(() => {
    if (settings.moveDate) setDateInput(settings.moveDate)
  }, [settings.moveDate])

  const days = daysUntil(settings.moveDate)
  const total = tasks.length
  const done = tasks.filter(t => t.done).length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const urgent = tasks
    .filter(t => !t.done && t.dueDate && daysUntil(t.dueDate) <= 7 && daysUntil(t.dueDate) >= 0)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  // Upcoming events + contact meetings (next 14 days, not done)
  const upcomingContacts = contacts
    .filter(c => {
      if (c.done) return false
      const dateStr = (c.meeting || '').split(' ')[0]
      const d = daysUntil(dateStr)
      return d !== null && d >= 0 && d <= 14
    })
    .map(c => {
      const parts = (c.meeting || '').split(' ')
      return { _type: 'contact', id: c.id, title: c.name, date: parts[0], time: parts[1] || '', location: c.profession || '' }
    })

  const upcomingEvents = [
    ...events
      .filter(e => {
        if (e.done) return false
        const d = daysUntil(e.date?.split('T')[0])
        return d !== null && d >= 0 && d <= 14
      })
      .map(e => ({ _type: 'event', ...e })),
    ...upcomingContacts
  ]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)

  function saveDate(val) {
    setDateInput(val)
    saveMeta('settings', { moveDate: val })
  }

  return (
    <>
      <div className="page-header">
        <h1>🏠 ניהול מעבר דירה</h1>
      </div>

      {/* Urgent tasks */}
      {urgent.length > 0 && (
        <div className="card">
          <div className="card-title">משימות דחופות 🔥</div>
          {urgent.map(t => {
            const assigneeName = t.assignee === 'all' ? 'כולם' : members[t.assignee] ? (members[t.assignee]).split(' ')[0] : ''
            return (
              <div key={t.id} onClick={() => switchTab('apartments')} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14, cursor: 'pointer' }}>
                <strong>{t.name}</strong>
                {assigneeName && <span style={{ color: 'var(--text-secondary)', marginRight: 8, fontSize: 12 }}>({assigneeName})</span>}
                <span style={{ color: 'var(--urgent)', marginRight: 8, fontSize: 12 }}>
                  {daysUntil(t.dueDate) === 0 ? 'היום!' : daysUntil(t.dueDate) === 1 ? 'מחר' : `עוד ${daysUntil(t.dueDate)} ימים`}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="card">
          <div className="card-title">אירועים קרובים 📅</div>
          {upcomingEvents.map(e => {
            const [y, m, day] = (e.date || '').split('-').map(Number)
            const d = new Date(y, m - 1, day)
            const dayName = HEBREW_DAYS[d.getDay()]
            const dateStr = d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })
            return (
              <div key={e._type + e.id} className="event-item" onClick={() => switchTab(e._type === 'contact' ? 'apartments' : 'calendar')} style={{ cursor: 'pointer' }}>
                <div className="event-date-block">
                  <div className="event-day">{d.getDate()}</div>
                  <div className="event-month">{dayName}</div>
                </div>
                <div className="event-body">
                  <div className="event-title">{e._type === 'contact' ? '📞 ' : ''}{e.title}</div>
                  <div className="event-time">
                    {dateStr}{e.time ? ` • ${e.time}` : ''}{e.location ? ` • ${e.location}` : ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

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
          <DateInput className="input" value={dateInput} onChange={saveDate} />
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
    </>
  )
}
