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

export default function Dashboard({ data, saveMeta, members, switchTab, focusEntry }) {
  const { tasks, settings, events, contacts } = data
  const [dateInput, setDateInput] = useState(settings.moveDate || '')
  const [listLimit, setListLimit] = useState(5)

  useEffect(() => {
    if (settings.moveDate) setDateInput(settings.moveDate)
  }, [settings.moveDate])

  useEffect(() => {
    function updateLimit() {
      const height = window.innerHeight || 760
      if (height >= 1080) setListLimit(8)
      else if (height >= 900) setListLimit(6)
      else if (height <= 700) setListLimit(3)
      else setListLimit(5)
    }
    updateLimit()
    window.addEventListener('resize', updateLimit)
    return () => window.removeEventListener('resize', updateLimit)
  }, [])

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

  const visibleUrgent = urgent.slice(0, listLimit)
  const visibleUpcomingEvents = upcomingEvents.slice(0, listLimit)

  function saveDate(val) {
    setDateInput(val)
    saveMeta('settings', { moveDate: val })
  }

  return (
    <>
      <div className="page-header">
        <p className="page-kicker">מרכז ניהול</p>
        <h1>ניהול מעבר דירה</h1>
        <p className="page-subtitle">תמונת מצב משותפת למשימות, אירועים והכנות</p>
      </div>

      <div className="dashboard-summary">
        <div className="summary-tile">
          <span className="summary-label">משימות פתוחות</span>
          <strong>{total - done}</strong>
        </div>
        <div className="summary-tile">
          <span className="summary-label">דחופות</span>
          <strong>{urgent.length}</strong>
        </div>
        <div className="summary-tile">
          <span className="summary-label">אירועים קרובים</span>
          <strong>{upcomingEvents.length}</strong>
        </div>
      </div>

      {/* Countdown */}
      <div className="card countdown-card">
        <div className="countdown-art" aria-hidden="true">
          <span className="box box-large" />
          <span className="box box-mid" />
          <span className="box box-small" />
          <span className="plant-stem" />
        </div>
        <div className="countdown-copy">
          <div className="card-title">מעבר דירה בעוד</div>
          {days !== null ? (
            <div className="countdown-display">
              <div className="countdown-number">עוד {Math.abs(days)} ימים</div>
              <div className="countdown-label">
                {days > 0 ? `יום המעבר: ${new Date(settings.moveDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}` : days === 0 ? 'יום המעבר!' : 'ימים אחרי המעבר'}
              </div>
            </div>
          ) : (
            <p className="empty-state">הגדר תאריך מעבר</p>
          )}
          <div className="input-group move-date-field">
            <label className="input-label">תאריך מעבר</label>
            <DateInput className="input" value={dateInput} onChange={saveDate} />
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card progress-card">
        <div className="card-title">התקדמות כללית</div>
        <div className="progress-layout">
          <div className="progress-ring" style={{ '--pct': pct }}>
            <span>{pct}%</span>
            <small>הושלמו</small>
          </div>
          <div className="progress-breakdown">
            <div><span>הושלמו</span><strong>{done}</strong></div>
            <div><span>בתהליך</span><strong>{total - done}</strong></div>
            <div><span>סה"כ</span><strong>{total}</strong></div>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-label">{pct}% הושלם ({done}/{total} משימות)</div>
      </div>

      {/* Urgent tasks */}
      {urgent.length > 0 && (
        <div className="card attention-card">
          <div className="card-title">משימות דחופות</div>
          {visibleUrgent.map(t => {
            const assigneeName = t.assignee === 'all' ? 'כולם' : members[t.assignee] ? (members[t.assignee]).split(' ')[0] : ''
            return (
              <div key={t.id} className="priority-row" onClick={() => focusEntry('apartments', { type: 'task', id: t.id })}>
                <strong>{t.name}</strong>
                {assigneeName && <span className="assignee-chip">{assigneeName}</span>}
                <em>
                  {daysUntil(t.dueDate) === 0 ? 'היום!' : daysUntil(t.dueDate) === 1 ? 'מחר' : `עוד ${daysUntil(t.dueDate)} ימים`}
                </em>
              </div>
            )
          })}
          {urgent.length > visibleUrgent.length && (
            <button className="card-link" onClick={() => switchTab('apartments')}>
              הצג את כל המשימות
            </button>
          )}
        </div>
      )}

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="card">
          <div className="card-title">אירועים קרובים</div>
          {visibleUpcomingEvents.map(e => {
            const [y, m, day] = (e.date || '').split('-').map(Number)
            const d = new Date(y, m - 1, day)
            const dayName = HEBREW_DAYS[d.getDay()]
            const dateStr = d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })
            return (
              <div
                key={e._type + e.id}
                className="event-item"
                onClick={() => focusEntry(e._type === 'contact' ? 'apartments' : 'calendar', { type: e._type, id: e.id })}
                style={{ cursor: 'pointer' }}
              >
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
          {upcomingEvents.length > visibleUpcomingEvents.length && (
            <button className="card-link" onClick={() => switchTab('calendar')}>
              הצג את כל האירועים
            </button>
          )}
        </div>
      )}
    </>
  )
}
