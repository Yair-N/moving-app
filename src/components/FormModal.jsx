import { useState, useEffect } from 'react'

export default function FormModal({ isOpen, onClose, onSave, title, saveLabel, children }) {
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (isOpen) setClosing(false)
  }, [isOpen])

  if (!isOpen && !closing) return null

  function handleClose() {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 200)
  }

  function handleSave() {
    onSave()
    handleClose()
  }

  return (
    <div className={`modal-overlay ${closing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`modal-panel ${closing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSave}>{saveLabel || 'שמור'}</button>
          <button className="btn btn-outline" onClick={handleClose}>ביטול</button>
        </div>
      </div>
    </div>
  )
}
