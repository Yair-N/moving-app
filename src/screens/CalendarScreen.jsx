import { useEffect, useState } from 'react'
import DateInput from '../components/DateInput'
import FormModal from '../components/FormModal'
import Fab from '../components/Fab'

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

const EMPTY_EVENT = { title: '', date: '', time: '', location: '', notes: '' }

export default function CalendarScreen({ data, add, update, remove, tab, focusTarget, clearFocusTarget }) {
  const { events } = data
  const [modal, setModal] = useState(null)
  const [highlighted, setHighlighted] = useState(null)

  const setField = (key, val) => setModal(prev => prev ? { ...prev, fields: { ...prev.fields, [key]: val } } : prev)

  function openAdd() {
    setModal({ mode: 'add', fields: { ...EMPTY_EVENT } })
  }

  function openEdit(ev) {
    setModal({ mode: 'edit', id: ev.id, fields: { title: ev.title, date: ev.date, time: ev.time || '', location: ev.location || '', notes: ev.notes || '' } })
  }

  function handleSave() {
    if (!modal) return
    const { title, date, time, location, notes } = modal.fields
    if (!title.trim() || !date) return
    if (modal.mode === 'add') {
      add('events', { title: title.trim(), date, time, location: location.trim(), notes: notes.trim() })
    } else {
      update('events', modal.id, { title: title.trim(), date, time, location: location.trim(), notes: notes.trim() })
    }
  }

  useEffect(() => {
    if (focusTarget?.tab !== 'calendar' || focusTarget.type !== 'event') return

    const focusKey = `event-${focusTarget.id}`
    const scrollTimer = setTimeout(() => {
      const el = document.getElementById(`focus-${focusKey}`)
      if (!el) return
      setHighlighted(focusKey)
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      clearFocusTarget?.()
    }, 120)
    const highlightTimer = setTimeout(() => setHighlighted(null), 2400)

    return () => {
      clearTimeout(scrollTimer)
      clearTimeout(highlightTimer)
    }
  }, [focusTarget, clearFocusTarget])

  const sorted = [...events].filter(e => !e.done).sort((a, b) => new Date(a.date) - new Date(b.date))
  const doneSorted = [...events].filter(e => e.done).sort((a, b) => new Date(a.date) - new Date(b.date))

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
        <p className="page-kicker">תיאומים ומועדים</p>
        <h1>לוח זמנים</h1>
      </div>

      <div className="desktop-actions">
        <button className="btn btn-primary" onClick={openAdd}>הוסף אירוע</button>
      </div>

      {sorted.length === 0 && doneSorted.length === 0 ? (
        <div className="card">
          <p className="empty-state">אין אירועים מתוכננים</p>
        </div>
      ) : sorted.length === 0 ? null : (
        Object.values(grouped).map(group => (
          <div key={group.label} className="event-group">
            <div className="section-divider">{group.label}</div>
            <div className="card">
              {group.events.map(ev => {
                const d = new Date(ev.date)
                const dayName = HEBREW_DAYS[d.getDay()]
                return (
                  <div
                    key={ev.id}
                    id={`focus-event-${ev.id}`}
                    className={`event-item ${highlighted === `event-${ev.id}` ? 'focus-highlight' : ''}`}
                    onClick={() => openEdit(ev)}
                    style={{ cursor: 'pointer', opacity: ev.done ? 0.5 : 1 }}
                  >
                    <div className="event-date-block">
                      <div className="event-day">{d.getDate()}</div>
                      <div className="event-month">{dayName}</div>
                    </div>
                    <div className="event-body">
                      <div className="event-title" style={{ textDecoration: ev.done ? 'line-through' : 'none' }}>{ev.title}</div>
                      <div className="event-time">
                        {ev.time && `${ev.time}`}{ev.location && ` • ${ev.location}`}
                        {' '}<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatILDate(ev.date)}</span>
                      </div>
                      {ev.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{ev.notes}</div>}
                    </div>
                    <div
                      className={`task-check ${ev.done ? 'done' : ''}`}
                      onClick={e => { e.stopPropagation(); update('events', ev.id, { done: !ev.done }) }}
                      style={{ flexShrink: 0 }}
                    >
                      {ev.done && '✓'}
                    </div>
                    <button className="event-delete" onClick={e => { e.stopPropagation(); remove('events', ev.id) }}>✕</button>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {doneSorted.length > 0 && (
        <>
          <div className="section-divider" style={{ color: 'var(--text-muted)' }}>הושלמו ✓</div>
          <div className="card" style={{ opacity: 0.65 }}>
            {doneSorted.map(ev => {
              const d = new Date(ev.date)
              const dayName = HEBREW_DAYS[d.getDay()]
              return (
                <div
                  key={ev.id}
                  id={`focus-event-${ev.id}`}
                  className={`event-item ${highlighted === `event-${ev.id}` ? 'focus-highlight' : ''}`}
                  onClick={() => openEdit(ev)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="event-date-block">
                    <div className="event-day">{d.getDate()}</div>
                    <div className="event-month">{dayName}</div>
                  </div>
                  <div className="event-body">
                    <div className="event-title" style={{ textDecoration: 'line-through' }}>{ev.title}</div>
                    <div className="event-time">
                      {ev.time && `${ev.time}`}{ev.location && ` • ${ev.location}`}
                      {' '}<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatILDate(ev.date)}</span>
                    </div>
                    {ev.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{ev.notes}</div>}
                  </div>
                  <div
                    className="task-check done"
                    onClick={e => { e.stopPropagation(); update('events', ev.id, { done: false }) }}
                    style={{ flexShrink: 0 }}
                  >
                    ✓
                  </div>
                  <button className="event-delete" onClick={e => { e.stopPropagation(); remove('events', ev.id) }}>✕</button>
                </div>
              )
            })}
          </div>
        </>
      )}

      <Fab onClick={openAdd} pulse={tab} />

      <FormModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        onSave={handleSave}
        title={modal?.mode === 'edit' ? 'עריכת אירוע' : 'הוסף אירוע'}
        saveLabel={modal?.mode === 'edit' ? 'שמור' : 'הוסף'}
      >
        {modal && (
          <>
            <div className="input-group">
              <input className="input" placeholder="שם האירוע" value={modal.fields.title}
                onChange={e => setField('title', e.target.value)} />
            </div>
            <div className="input-row">
              <DateInput className="input" value={modal.fields.date} onChange={v => setField('date', v)} />
              <TimeInput value={modal.fields.time} onChange={v => setField('time', v)} />
            </div>
            <div className="input-group">
              <input className="input" placeholder="מיקום (אופציונלי)" value={modal.fields.location}
                onChange={e => setField('location', e.target.value)} />
            </div>
            <div className="input-group">
              <input className="input" placeholder="הערות (אופציונלי)" value={modal.fields.notes}
                onChange={e => setField('notes', e.target.value)} />
            </div>
          </>
        )}
      </FormModal>
    </>
  )
}
