// ============================================================
// הגדרות Firebase
// ============================================================
// 1. כנס ל- https://console.firebase.google.com
// 2. צור פרויקט חדש בשם "moving-app" (חינם)
// 3. הפעל Authentication → Google
// 4. הפעל Firestore Database
// 5. לחץ על גלגל השיניים → Project Settings → Add web app
// 6. העתק את הנתונים ל-firebaseConfig למטה
// ============================================================

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCh846VUVD4RtOhxW6iG2SZ12SXKvZZiK8",
  authDomain: "moving-app-c82d0.firebaseapp.com",
  projectId: "moving-app-c82d0",
  storageBucket: "moving-app-c82d0.firebasestorage.app",
  messagingSenderId: "949050959400",
  appId: "1:949050959400:web:10a27a2257c412f6fa371d"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

const provider = new GoogleAuthProvider()
provider.addScope('https://www.googleapis.com/auth/calendar')

export const loginWithGoogle = () => signInWithPopup(auth, provider)
export const logout = () => signOut(auth)

export const getCalendarToken = async () => {
  const result = await signInWithPopup(auth, provider)
  return GoogleAuthProvider.credentialFromResult(result)?.accessToken
}

export async function pushEventsToGoogleCalendar(accessToken, events) {
  const results = []
  for (const ev of events) {
    const startDate = ev.date?.includes('T') ? ev.date : ev.date
    const hasTime = !!ev.time
    const body = {
      summary: ev.title,
      location: ev.location || undefined,
      description: ev.notes || undefined,
    }
    if (hasTime) {
      const dateTime = `${ev.date}T${ev.time}:00`
      body.start = { dateTime, timeZone: 'Asia/Jerusalem' }
      body.end = { dateTime, timeZone: 'Asia/Jerusalem' }
    } else {
      body.start = { date: ev.date }
      body.end = { date: ev.date }
    }
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    results.push({ title: ev.title, ok: res.ok })
  }
  return results
}
