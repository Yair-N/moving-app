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

export const loginWithGoogle = () => signInWithPopup(auth, provider)
export const logout = () => signOut(auth)
