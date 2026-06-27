import { useState } from 'react'
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function HouseholdSetup({ user, onComplete }) {
  const [mode, setMode] = useState(null)
  const [code, setCode] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    setError('')
    const householdId = generateCode()
    try {
      await setDoc(doc(db, 'households', householdId, 'meta', 'info'), {
        createdBy: user.uid,
        members: [user.uid],
        memberNames: { [user.uid]: user.displayName || '' },
        createdAt: new Date()
      })
      await setDoc(doc(db, 'users', user.uid), {
        householdId,
        displayName: user.displayName || '',
        email: user.email || ''
      })
      setCreatedCode(householdId)
    } catch (e) {
      setError('שגיאה ביצירת משק בית. נסה שוב.')
    }
    setLoading(false)
  }

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 6) {
      setError('קוד חייב להיות בן 6 תווים')
      return
    }
    setLoading(true)
    setError('')
    try {
      const infoRef = doc(db, 'households', trimmed, 'meta', 'info')
      const snap = await getDoc(infoRef)
      if (!snap.exists()) {
        setError('קוד לא נמצא. בדוק שוב.')
        setLoading(false)
        return
      }
      await updateDoc(infoRef, {
        members: arrayUnion(user.uid),
        [`memberNames.${user.uid}`]: user.displayName || ''
      })
      await setDoc(doc(db, 'users', user.uid), {
        householdId: trimmed,
        displayName: user.displayName || '',
        email: user.email || ''
      })
      onComplete(trimmed)
    } catch (e) {
      setError('שגיאה בהצטרפות. נסה שוב.')
    }
    setLoading(false)
  }

  if (createdCode) {
    return (
      <div className="auth-screen">
        <div className="auth-emoji">🎉</div>
        <h1 className="auth-title">משק הבית נוצר</h1>
        <p className="auth-sub">שלח את הקוד הזה לבן/בת הזוג כדי להצטרף</p>
        <div className="household-code">{createdCode}</div>
        <button
          className="btn btn-primary"
          onClick={() => onComplete(createdCode)}
        >
          המשך לאפליקציה
        </button>
      </div>
    )
  }

  if (!mode) {
    return (
      <div className="auth-screen">
        <div className="auth-emoji">👫</div>
        <h1 className="auth-title">הגדרת משק בית</h1>
        <p className="auth-sub">צרו משק בית משותף כדי לנהל את המעבר יחד</p>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => setMode('create')}>
            יצירת משק בית חדש
          </button>
          <button className="btn btn-outline" onClick={() => setMode('join')}>
            הצטרפות עם קוד
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'create') {
    return (
      <div className="auth-screen">
        <div className="auth-emoji">🏠</div>
        <h1 className="auth-title">יצירת משק בית</h1>
        <p className="auth-sub">תקבל קוד בן 6 תווים לשלוח לבן/בת הזוג</p>
        <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
          {loading ? 'יוצר...' : 'צור משק בית'}
        </button>
        {error && <p style={{ color: 'var(--urgent)', fontSize: '14px' }}>{error}</p>}
        <button className="btn-logout" onClick={() => { setMode(null); setError('') }}>
          חזרה
        </button>
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <div className="auth-emoji">🔑</div>
      <h1 className="auth-title">הצטרפות למשק בית</h1>
      <p className="auth-sub">הזן את הקוד שקיבלת מבן/בת הזוג</p>
      <input
        className="input"
        placeholder="הזן קוד בן 6 תווים"
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        maxLength={6}
        style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '6px', fontWeight: 700 }}
      />
      <button className="btn btn-primary" onClick={handleJoin} disabled={loading || code.trim().length < 6}>
        {loading ? 'מצטרף...' : 'הצטרף'}
      </button>
      {error && <p style={{ color: 'var(--urgent)', fontSize: '14px' }}>{error}</p>}
      <button className="btn-logout" onClick={() => { setMode(null); setError('') }}>
        חזרה
      </button>
    </div>
  )
}
