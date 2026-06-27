import { useState, useEffect } from 'react'

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

  return (
    <input
      className={className || 'input'}
      placeholder={placeholder || 'DD/MM/YYYY'}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      inputMode="numeric"
      maxLength={10}
    />
  )
}
