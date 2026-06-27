import { useState } from 'react'

export default function Fab({ actions, onClick }) {
  const [open, setOpen] = useState(false)

  if (!actions && !onClick) return null

  if (!actions || actions.length === 1) {
    return (
      <div className="fab">
        <button className="fab-main" onClick={onClick || actions?.[0]?.onClick}>+</button>
      </div>
    )
  }

  return (
    <>
      {open && <div className="fab-backdrop" onClick={() => setOpen(false)} />}
      <div className="fab">
        {open && (
          <div className="fab-actions">
            {actions.map((a, i) => (
              <div key={i} className="fab-action visible" style={{ transitionDelay: `${i * 50}ms` }}>
                <button className="fab-action-btn" onClick={() => { setOpen(false); a.onClick() }}>
                  {a.icon}
                </button>
                <span className="fab-action-label">{a.label}</span>
              </div>
            ))}
          </div>
        )}
        <button className={`fab-main ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>+</button>
      </div>
    </>
  )
}
