import { useState, useEffect, useRef, useCallback } from 'react'
import { auth, db, loginWithGoogle, logout } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc,
  setDoc, getDoc, serverTimestamp
} from 'firebase/firestore'
import Dashboard from './screens/Dashboard'
import Apartments from './screens/Apartments'
import Packing from './screens/Packing'
import CalendarScreen from './screens/CalendarScreen'
import Shopping from './screens/Shopping'
import HouseholdSetup from './screens/HouseholdSetup'

const TABS = [
  { id: 'dashboard', label: 'לוח בקרה', icon: '⊞' },
  { id: 'apartments', label: 'דירות', icon: '🏠' },
  { id: 'packing', label: 'אריזה', icon: '📦' },
  { id: 'calendar', label: 'לוח', icon: '📅' },
  { id: 'shopping', label: 'קניות', icon: '🛒' },
]

function AuthScreen({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await onLogin()
    } catch (err) {
      console.error('Login failed:', err)
      if (err.code === 'auth/unauthorized-domain') {
        setError('הדומיין לא מורשה ב-Firebase. יש להוסיף אותו ב-Authentication → Settings → Authorized domains')
      } else if (err.code === 'auth/popup-blocked') {
        setError('הדפדפן חסם את החלון הקופץ. יש לאשר חלונות קופצים לאתר זה')
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError(null)
      } else {
        setError(`שגיאת התחברות: ${err.code || err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-emoji">🏠</div>
      <h1 className="auth-title">מעבר דירה</h1>
      <p className="auth-sub">התחבר כדי לנהל את המעבר שלך ושל בן/בת הזוג יחד</p>
      {error && <p style={{ color: '#c0392b', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
      <button className="btn-google" onClick={handleLogin} disabled={loading}>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {loading ? 'מתחבר...' : 'כניסה עם Google'}
      </button>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [householdId, setHouseholdId] = useState(null)
  const [householdLoading, setHouseholdLoading] = useState(true)
  const [tab, setTab] = useState('dashboard')
  const [slideDir, setSlideDir] = useState(null)
  const [members, setMembers] = useState({})
  const [data, setData] = useState({
    tasks: [],
    contacts: [],
    boxes: [],
    events: [],
    itemsForSale: [],
    shoppingList: [],
    movingCompany: null,
    settings: { moveDate: '' }
  })

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
      if (!u) {
        setHouseholdId(null)
        setHouseholdLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (!user) return
    setHouseholdLoading(true)
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists() && snap.data().householdId) {
        setHouseholdId(snap.data().householdId)
      } else {
        setHouseholdId(null)
      }
      setHouseholdLoading(false)
    })
    return unsub
  }, [user])

  useEffect(() => {
    if (!user || !householdId) return
    const hid = householdId
    const cols = ['tasks', 'contacts', 'boxes', 'events', 'itemsForSale', 'shoppingList']
    const unsubs = cols.map(col =>
      onSnapshot(collection(db, 'households', hid, col), snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setData(prev => ({ ...prev, [col]: items }))
      })
    )
    const infoUnsub = onSnapshot(doc(db, 'households', hid, 'meta', 'info'), snap => {
      if (snap.exists()) setMembers(snap.data().memberNames || {})
    })
    const settingsUnsub = onSnapshot(doc(db, 'households', hid, 'meta', 'settings'), snap => {
      if (snap.exists()) setData(prev => ({ ...prev, settings: snap.data() }))
    })
    const mcUnsub = onSnapshot(doc(db, 'households', hid, 'meta', 'movingCompany'), snap => {
      if (snap.exists()) setData(prev => ({ ...prev, movingCompany: snap.data() }))
    })
    return () => { unsubs.forEach(u => u()); infoUnsub(); settingsUnsub(); mcUnsub() }
  }, [user, householdId])

  // Prevent back button from exiting the app
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const onPopState = () => {
      window.history.pushState(null, '', window.location.href)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Swipe gestures
  const touchStart = useRef(null)
  const tabIds = TABS.map(t => t.id)

  const handleTouchStart = useCallback((e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const switchTab = useCallback((newTab, dir) => {
    if (newTab === tab) return
    setSlideDir(dir)
    setTimeout(() => {
      setTab(newTab)
      setTimeout(() => setSlideDir(null), 300)
    }, 10)
  }, [tab])

  const handleTouchEnd = useCallback((e) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx)) return
    const idx = tabIds.indexOf(tab)
    if (dx > 0 && idx < tabIds.length - 1) switchTab(tabIds[idx + 1], 'slide-left')
    else if (dx < 0 && idx > 0) switchTab(tabIds[idx - 1], 'slide-right')
  }, [tabIds, tab, switchTab])

  const add = (col, obj) => addDoc(collection(db, 'households', householdId, col), { ...obj, createdAt: serverTimestamp() })
  const update = (col, id, obj) => updateDoc(doc(db, 'households', householdId, col, id), obj)
  const remove = (col, id) => {
    if (window.confirm('בטוח?')) deleteDoc(doc(db, 'households', householdId, col, id))
  }
  const saveMeta = (docName, obj) => setDoc(doc(db, 'households', householdId, 'meta', docName), obj, { merge: true })

  if (authLoading) return <div className="auth-screen"><div className="auth-emoji">🏠</div></div>
  if (!user) return <AuthScreen onLogin={loginWithGoogle} />
  if (householdLoading) return <div className="auth-screen"><div className="auth-emoji">🏠</div></div>
  if (!householdId) return <HouseholdSetup user={user} onComplete={setHouseholdId} />

  const screenProps = { data, add, update, remove, saveMeta, user, members, tab, switchTab }

  return (
    <div className="app">
      <div className="main-area">
        <div className="user-row">
          <button className="btn-logout" onClick={logout}>יציאה</button>
          <span>{user.displayName?.split(' ')[0]}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 'auto' }}
            onClick={() => navigator.clipboard?.writeText(householdId)}
            title="לחץ להעתקה">
            קוד: {householdId}
          </span>
        </div>

        <div className={`page-content ${slideDir || ''}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {tab === 'dashboard'  && <Dashboard  {...screenProps} />}
          {tab === 'apartments' && <Apartments {...screenProps} />}
          {tab === 'packing'    && <Packing    {...screenProps} />}
          {tab === 'calendar'   && <CalendarScreen {...screenProps} />}
          {tab === 'shopping'   && <Shopping   {...screenProps} />}
        </div>
      </div>

      <nav className="bottom-nav">
        <div className="nav-brand">🏠 מעבר דירה</div>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-item ${tab === t.id ? 'active' : ''}`}
            onClick={() => {
              const oldIdx = tabIds.indexOf(tab)
              const newIdx = tabIds.indexOf(t.id)
              if (oldIdx === newIdx) return
              switchTab(t.id, newIdx > oldIdx ? 'slide-left' : 'slide-right')
            }}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
