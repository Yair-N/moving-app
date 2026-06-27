import { useState } from 'react'
import DateInput from '../components/DateInput'

function firstName(fullName) {
  return (fullName || '').split(' ')[0] || '?'
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

export default function Apartments({ data, add, update, remove, user, members }) {
  const { tasks, contacts } = data
  const [apt, setApt] = useState('leaving')
  const [filter, setFilter] = useState('all')
  const [taskName, setTaskName] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('all')
  const [contactName, setContactName] = useState('')
  const [contactProf, setContactProf] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactMeeting, setContactMeeting] = useState('')
  const [contactTime, setContactTime] = useState('')

  const memberEntries = Object.entries(members)

  const aptTasks = tasks.filter(t => t.apt === apt)
  const filtered = filter === 'all' ? aptTasks : aptTasks.filter(t => t.assignee === filter)
  const sorted = [...filtered].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))

  function addTask(e) {
    e.preventDefault()
    if (!taskName.trim()) return
    add('tasks', { name: taskName.trim(), apt, assignee: taskAssignee, dueDate: taskDate, done: false })
    setTaskName('')
    setTaskDate('')
    setTaskAssignee('all')
  }

  function toggleTask(t) {
    update('tasks', t.id, { done: !t.done })
  }

  function addContact(e) {
    e.preventDefault()
    if (!contactName.trim()) return
    const meeting = contactMeeting && contactTime ? `${contactMeeting} ${contactTime}` : contactMeeting
    add('contacts', { name: contactName.trim(), profession: contactProf.trim(), phone: contactPhone.trim(), meeting })
    setContactName(''); setContactProf(''); setContactPhone(''); setContactMeeting(''); setContactTime('')
  }

  function assigneeLabel(assignee) {
    if (assignee === 'all') return 'כולם'
    if (members[assignee]) return firstName(members[assignee])
    return assignee
  }

  function badgeClass(assignee) {
    if (assignee === 'all') return 'badge-both'
    const idx = Object.keys(members).indexOf(assignee)
    return idx === 0 ? 'badge-his' : idx === 1 ? 'badge-hers' : 'badge-both'
  }

  return (
    <>
      <div className="page-header">
        <h1>🏠 דירות</h1>
      </div>

      <div className="tab-toggle">
        <button className={`tab-btn ${apt === 'leaving' ? 'active' : ''}`} onClick={() => setApt('leaving')}>
          דירה שעוזבים
        </button>
        <button className={`tab-btn ${apt === 'new' ? 'active' : ''}`} onClick={() => setApt('new')}>
          דירה שנכנסים
        </button>
      </div>

      <div className="filter-row">
        <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          הכל
        </button>
        {memberEntries.map(([uid, name]) => (
          <button key={uid} className={`filter-pill ${filter === uid ? 'active' : ''}`} onClick={() => setFilter(uid)}>
            👤 {firstName(name)}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-title">משימות</div>
        {sorted.length === 0 ? (
          <p className="empty-state">אין משימות עדיין</p>
        ) : (
          sorted.map(t => (
            <div key={t.id} className="task-item">
              <div className={`task-check ${t.done ? 'done' : ''}`} onClick={() => toggleTask(t)}>
                {t.done && '✓'}
              </div>
              <div className="task-body">
                <div className={`task-name ${t.done ? 'done' : ''}`}>{t.name}</div>
                {t.dueDate && <div className="task-meta">📅 {formatDate(t.dueDate)}</div>}
              </div>
              <span className={`task-badge ${badgeClass(t.assignee)}`}>{assigneeLabel(t.assignee)}</span>
              <button className="task-delete" onClick={() => remove('tasks', t.id)}>✕</button>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div className="card-title">הוסף משימה ➕</div>
        <form onSubmit={addTask}>
          <div className="input-group">
            <input className="input" placeholder="שם המשימה" value={taskName} onChange={e => setTaskName(e.target.value)} />
          </div>
          <div className="input-row">
            <DateInput className="input" value={taskDate} onChange={setTaskDate} />
            <select className="input" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}>
              <option value="all">כולם</option>
              {memberEntries.map(([uid, name]) => (
                <option key={uid} value={uid}>{firstName(name)}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">הוסף</button>
        </form>
      </div>

      <div className="card">
        <div className="card-title">אנשי קשר ומתקינים 📞</div>
        {contacts.length === 0 ? (
          <p className="empty-state">אין אנשי קשר עדיין</p>
        ) : (
          contacts.map(c => (
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
          <div className="input-row">
            <DateInput className="input" value={contactMeeting} onChange={setContactMeeting} />
            <input className="input" placeholder="שעה (14:00)" value={contactTime || ''} onChange={e => {
              const v = e.target.value.replace(/[^0-9:]/g, '')
              if (v.length === 2 && !v.includes(':') && (contactTime || '').length < 2) setContactTime(v + ':')
              else setContactTime(v.slice(0, 5))
            }} inputMode="numeric" maxLength={5} />
          </div>
          <button type="submit" className="btn btn-secondary">הוסף איש קשר</button>
        </form>
      </div>
    </>
  )
}
