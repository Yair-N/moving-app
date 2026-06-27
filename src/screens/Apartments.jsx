import { useState } from 'react'

const ASSIGNEE_OPTS = [
  { value: 'both', label: 'שנינו', badge: 'badge-both' },
  { value: 'his', label: 'שלו', badge: 'badge-his' },
  { value: 'hers', label: 'שלה', badge: 'badge-hers' },
]

const FILTER_OPTS = [
  { value: 'all', label: 'הכל' },
  { value: 'his', label: '👤 שלו' },
  { value: 'hers', label: '👤 שלה' },
  { value: 'both', label: '👥 שנינו' },
]

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })
}

export default function Apartments({ data, add, update, remove }) {
  const { tasks, contacts } = data
  const [apt, setApt] = useState('leaving') // 'leaving' | 'new'
  const [filter, setFilter] = useState('all')
  const [taskName, setTaskName] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('both')
  const [contactName, setContactName] = useState('')
  const [contactProf, setContactProf] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactMeeting, setContactMeeting] = useState('')

  const aptTasks = tasks.filter(t => t.apt === apt)
  const filtered = filter === 'all' ? aptTasks : aptTasks.filter(t => t.assignee === filter)
  const sorted = [...filtered].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))

  function addTask(e) {
    e.preventDefault()
    if (!taskName.trim()) return
    add('tasks', { name: taskName.trim(), apt, assignee: taskAssignee, dueDate: taskDate, done: false })
    setTaskName('')
    setTaskDate('')
    setTaskAssignee('both')
  }

  function toggleTask(t) {
    update('tasks', t.id, { done: !t.done })
  }

  function addContact(e) {
    e.preventDefault()
    if (!contactName.trim()) return
    add('contacts', { name: contactName.trim(), profession: contactProf.trim(), phone: contactPhone.trim(), meeting: contactMeeting })
    setContactName(''); setContactProf(''); setContactPhone(''); setContactMeeting('')
  }

  const aptContacts = contacts // contacts shared across both apartments

  return (
    <>
      <div className="page-header">
        <h1>🏠 דירות</h1>
      </div>

      {/* Apartment toggle */}
      <div className="tab-toggle">
        <button className={`tab-btn ${apt === 'leaving' ? 'active' : ''}`} onClick={() => setApt('leaving')}>
          הדירה העזובה
        </button>
        <button className={`tab-btn ${apt === 'new' ? 'active' : ''}`} onClick={() => setApt('new')}>
          הדירה החדשה
        </button>
      </div>

      {/* Filter */}
      <div className="filter-row">
        {FILTER_OPTS.map(f => (
          <button key={f.value} className={`filter-pill ${filter === f.value ? 'active' : ''}`} onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="card">
        <div className="card-title">משימות</div>
        {sorted.length === 0 ? (
          <p className="empty-state">אין משימות עדיין</p>
        ) : (
          sorted.map(t => {
            const a = ASSIGNEE_OPTS.find(o => o.value === t.assignee) || ASSIGNEE_OPTS[0]
            return (
              <div key={t.id} className="task-item">
                <div className={`task-check ${t.done ? 'done' : ''}`} onClick={() => toggleTask(t)}>
                  {t.done && '✓'}
                </div>
                <div className="task-body">
                  <div className={`task-name ${t.done ? 'done' : ''}`}>{t.name}</div>
                  {t.dueDate && <div className="task-meta">📅 {formatDate(t.dueDate)}</div>}
                </div>
                <span className={`task-badge ${a.badge}`}>{a.label}</span>
                <button className="task-delete" onClick={() => remove('tasks', t.id)}>✕</button>
              </div>
            )
          })
        )}
      </div>

      {/* Add task */}
      <div className="card">
        <div className="card-title">הוסף משימה ➕</div>
        <form onSubmit={addTask}>
          <div className="input-group">
            <input className="input" placeholder="שם המשימה" value={taskName} onChange={e => setTaskName(e.target.value)} />
          </div>
          <div className="input-row">
            <input type="date" className="input" value={taskDate} onChange={e => setTaskDate(e.target.value)} />
            <select className="input" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}>
              {ASSIGNEE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">הוסף</button>
        </form>
      </div>

      {/* Contacts */}
      <div className="card">
        <div className="card-title">אנשי קשר ומתקינים 📞</div>
        {aptContacts.length === 0 ? (
          <p className="empty-state">אין אנשי קשר עדיין</p>
        ) : (
          aptContacts.map(c => (
            <div key={c.id} className="contact-item">
              <div className="contact-name">{c.name}</div>
              {c.profession && <div className="contact-meta">{c.profession}</div>}
              {c.phone && <div className="contact-phone">📱 {c.phone}</div>}
              {c.meeting && <div className="contact-meeting">🗓️ {c.meeting}</div>}
              <button className="task-delete" onClick={() => remove('contacts', c.id)} style={{ float: 'left' }}>✕</button>
            </div>
          ))
        )}

        <div className="section-divider" style={{ marginTop: 12 }}>הוסף איש קשר</div>
        <form onSubmit={addContact}>
          <div className="input-group">
            <input className="input" placeholder="שם" value={contactName} onChange={e => setContactName(e.target.value)} />
          </div>
          <div className="input-row">
            <input className="input" placeholder="מקצוע (אינטרנט, גז...)" value={contactProf} onChange={e => setContactProf(e.target.value)} />
            <input className="input" placeholder="טלפון" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
          </div>
          <div className="input-group">
            <input type="datetime-local" className="input" value={contactMeeting} onChange={e => setContactMeeting(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-secondary">הוסף איש קשר</button>
        </form>
      </div>
    </>
  )
}
