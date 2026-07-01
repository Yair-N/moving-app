import { useEffect, useState } from 'react'
import DateInput from '../components/DateInput'
import FormModal from '../components/FormModal'
import Fab from '../components/Fab'

function firstName(fullName) {
  return (fullName || '').split(' ')[0] || '?'
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

export default function Apartments({ data, add, update, remove, user, members, tab, focusTarget, clearFocusTarget }) {
  const { tasks, contacts } = data
  const [apt, setApt] = useState('leaving')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [highlighted, setHighlighted] = useState(null)

  const memberEntries = Object.entries(members)
  const setField = (key, val) => setModal(prev => prev ? { ...prev, fields: { ...prev.fields, [key]: val } } : prev)

  function openAddTask() {
    setModal({ mode: 'add', type: 'task', fields: { name: '', dueDate: '', assignee: 'all' } })
  }
  function openAddContact() {
    setModal({ mode: 'add', type: 'contact', fields: { name: '', profession: '', phone: '', meeting: '', time: '' } })
  }
  function openEditTask(t) {
    setModal({ mode: 'edit', type: 'task', id: t.id, fields: { name: t.name, dueDate: t.dueDate || '', assignee: t.assignee || 'all' } })
  }
  function openEditContact(c) {
    const parts = (c.meeting || '').split(' ')
    setModal({ mode: 'edit', type: 'contact', id: c.id, fields: { name: c.name, profession: c.profession || '', phone: c.phone || '', meeting: parts[0] || '', time: parts[1] || '' } })
  }

  function handleSave() {
    if (!modal) return
    const { name } = modal.fields
    if (!name.trim()) return

    if (modal.type === 'task') {
      const obj = { name: name.trim(), dueDate: modal.fields.dueDate, assignee: modal.fields.assignee }
      if (modal.mode === 'add') add('tasks', { ...obj, apt, done: false })
      else update('tasks', modal.id, obj)
    } else {
      const meeting = modal.fields.meeting && modal.fields.time ? `${modal.fields.meeting} ${modal.fields.time}` : modal.fields.meeting
      const obj = { name: name.trim(), profession: modal.fields.profession.trim(), phone: modal.fields.phone.trim(), meeting }
      if (modal.mode === 'add') add('contacts', obj)
      else update('contacts', modal.id, obj)
    }
  }

  function toggleTask(t) {
    update('tasks', t.id, { done: !t.done })
  }

  function assigneeLabel(assignee) {
    if (assignee === 'all') return 'כולם'
    if (members[assignee]) return firstName(members[assignee])
    return assignee
  }

  function badgeClass(assignee) {
    if (assignee === 'all') return 'badge-all'
    if (assignee === user.uid) return 'badge-self'
    return 'badge-other'
  }

  useEffect(() => {
    if (focusTarget?.tab !== 'apartments') return
    if (focusTarget.type === 'task') {
      const task = tasks.find(t => t.id === focusTarget.id)
      if (task) {
        setApt(task.apt || 'leaving')
        setFilter('all')
      }
    }

    const focusKey = `${focusTarget.type}-${focusTarget.id}`
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
  }, [focusTarget, tasks, clearFocusTarget])

  const aptTasks = tasks.filter(t => t.apt === apt)
  const filtered = filter === 'all' ? aptTasks : aptTasks.filter(t => t.assignee === filter)
  const sorted = [...filtered].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const dateA = a.dueDate || '9999'
    const dateB = b.dueDate || '9999'
    return dateA.localeCompare(dateB)
  })

  const modalTitle = modal?.mode === 'edit'
    ? (modal.type === 'task' ? 'עריכת משימה' : 'עריכת איש קשר')
    : (modal?.type === 'task' ? 'הוסף משימה' : 'הוסף איש קשר')

  return (
    <>
      <div className="page-header">
        <p className="page-kicker">משימות וספקים</p>
        <h1>דירות</h1>
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

      <div className="desktop-actions">
        <button className="btn btn-primary" onClick={openAddTask}>הוסף משימה</button>
        <button className="btn btn-outline" onClick={openAddContact}>הוסף איש קשר</button>
      </div>

      <div className="card">
        <div className="card-title">משימות</div>
        {sorted.length === 0 ? (
          <p className="empty-state">אין משימות עדיין</p>
        ) : (
          sorted.map(t => (
            <div
              key={t.id}
              id={`focus-task-${t.id}`}
              className={`task-item ${highlighted === `task-${t.id}` ? 'focus-highlight' : ''}`}
              onClick={() => openEditTask(t)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`task-check ${t.done ? 'done' : ''}`} onClick={e => { e.stopPropagation(); toggleTask(t) }}>
                {t.done && '✓'}
              </div>
              <div className="task-body">
                <div className={`task-name ${t.done ? 'done' : ''}`}>{t.name}</div>
                {t.dueDate && <div className="task-meta">📅 {formatDate(t.dueDate)}</div>}
              </div>
              <span className={`task-badge ${badgeClass(t.assignee)}`}>{assigneeLabel(t.assignee)}</span>
              <button className="task-delete" onClick={e => { e.stopPropagation(); remove('tasks', t.id) }}>✕</button>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          אנשי קשר ומתקינים
          <button className="btn btn-outline" onClick={openAddContact} style={{ padding: '4px 12px', fontSize: 12 }}>+ הוסף</button>
        </div>
        {contacts.length === 0 ? (
          <p className="empty-state">אין אנשי קשר עדיין</p>
        ) : (
          [...contacts].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1)).map(c => (
            <div
              key={c.id}
              id={`focus-contact-${c.id}`}
              className={`contact-item ${highlighted === `contact-${c.id}` ? 'focus-highlight' : ''}`}
              onClick={() => openEditContact(c)}
              style={{ cursor: 'pointer', opacity: c.done ? 0.55 : 1 }}
            >
              <div
                className={`task-check ${c.done ? 'done' : ''}`}
                onClick={e => { e.stopPropagation(); update('contacts', c.id, { done: !c.done }) }}
                style={{ flexShrink: 0 }}
              >
                {c.done && '✓'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="contact-name" style={{ textDecoration: c.done ? 'line-through' : 'none' }}>{c.name}</div>
                {c.profession && <div className="contact-meta">{c.profession}</div>}
                {c.phone && <div className="contact-phone">📱 {c.phone}</div>}
                {c.meeting && <div className="contact-meeting">🗓️ {c.meeting}</div>}
              </div>
              <button className="task-delete" onClick={e => { e.stopPropagation(); remove('contacts', c.id) }}>✕</button>
            </div>
          ))
        )}
      </div>

      <Fab onClick={openAddTask} pulse={tab} />

      <FormModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        onSave={handleSave}
        title={modalTitle}
        saveLabel={modal?.mode === 'edit' ? 'שמור' : 'הוסף'}
      >
        {modal?.type === 'task' && (
          <>
            <div className="input-group">
              <input className="input" placeholder="שם המשימה" value={modal.fields.name}
                onChange={e => setField('name', e.target.value)} />
            </div>
            <div className="input-row">
              <DateInput className="input" value={modal.fields.dueDate} onChange={v => setField('dueDate', v)} />
              <select className="input" value={modal.fields.assignee} onChange={e => setField('assignee', e.target.value)}>
                <option value="all">כולם</option>
                {memberEntries.map(([uid, name]) => (
                  <option key={uid} value={uid}>{firstName(name)}</option>
                ))}
              </select>
            </div>
          </>
        )}
        {modal?.type === 'contact' && (
          <>
            <div className="input-group">
              <input className="input" placeholder="שם" value={modal.fields.name}
                onChange={e => setField('name', e.target.value)} />
            </div>
            <div className="input-row">
              <input className="input" placeholder="מקצוע (אינטרנט, גז...)" value={modal.fields.profession}
                onChange={e => setField('profession', e.target.value)} />
              <input className="input" placeholder="טלפון" value={modal.fields.phone}
                onChange={e => setField('phone', e.target.value)} />
            </div>
            <div className="input-row">
              <DateInput className="input" value={modal.fields.meeting} onChange={v => setField('meeting', v)} />
              <div style={{ flex: 1 }}>
                <input className="input" placeholder="שעה (14:00)" value={modal.fields.time} onChange={e => {
                  const v = e.target.value.replace(/[^0-9:]/g, '')
                  if (v.length === 2 && !v.includes(':') && (modal.fields.time || '').length < 2) setField('time', v + ':')
                  else setField('time', v.slice(0, 5))
                }} inputMode="numeric" maxLength={5} style={{ width: '100%' }} />
              </div>
            </div>
          </>
        )}
      </FormModal>
    </>
  )
}
