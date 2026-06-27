import { useState, useEffect, useRef } from 'react'

function toDisplay(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  if (!y || !m || !d) return ''
  return `${d}/${m}/${y}`
}

function toISO(display) {
  const match = display.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return null
  const [, d, m, y] = match
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function autoFormat(raw) {
  const digits = raw.replace(/[^0-9]/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4, 8)
}

export default function DateInput({ value, onChange, placeholder, className }) {
  const [display, setDisplay] = useState(toDisplay(value))
  const nativeRef = useRef(null)

  useEffect(() => {
    setDisplay(toDisplay(value))
  }, [value])

  function handleChange(e) {
    const formatted = autoFormat(e.target.value)
    setDisplay(formatted)
    const iso = toISO(formatted)
    if (iso) onChange(iso)
  }

  function handleBlur() {
    const iso = toISO(display)
    if (iso) {
      onChange(iso)
      setDisplay(toDisplay(iso))
    } else if (!display) {
      onChange('')
    }
  }

  function handleNativeChange(e) {
    const val = e.target.value
    if (val) {
      onChange(val)
      setDisplay(toDisplay(val))
    }
  }

  function openPicker() {
    if (nativeRef.current?.showPicker) {
      nativeRef.current.showPicker()
    }
  }

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <input
        className={className || 'input'}
        placeholder={placeholder || 'DD/MM/YYYY'}
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        inputMode="numeric"
        maxLength={10}
      />
      <input
        ref={nativeRef}
        type="date"
        value={value || ''}
        onChange={handleNativeChange}
        style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0, left: 0,
          opacity: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer',
        }}
        tabIndex={-1}
      />
    </div>
  )
}
