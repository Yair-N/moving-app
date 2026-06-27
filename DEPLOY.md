# הוראות הפעלה ופריסה

## שלב 1 — Firebase (5 דקות)

1. כנס ל-https://console.firebase.google.com
2. לחץ **Create a project** → שם: `moving-app`
3. בתפריט השמאלי: **Authentication** → Get started → **Google** → Enable → Save
4. בתפריט השמאלי: **Firestore Database** → Create database → **Start in test mode** → Next → Done
5. לחץ על גלגל השיניים (⚙️) → **Project settings**
6. גלול מטה → **Your apps** → לחץ על `</>` (Web)
7. שם האפליקציה: `moving-app` → Register app
8. **העתק** את אובייקט `firebaseConfig` שמופיע

## שלב 2 — הדבק את ה-config

פתח את הקובץ `src/firebase.js` והחלף את הערכים:

```js
const firebaseConfig = {
  apiKey: "הדבק כאן",
  authDomain: "הדבק כאן",
  projectId: "הדבק כאן",
  storageBucket: "הדבק כאן",
  messagingSenderId: "הדבק כאן",
  appId: "הדבק כאן"
}
```

## שלב 3 — הגדר Firestore Rules

ב-Firebase Console → Firestore → **Rules** → הדבק:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /households/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

לחץ **Publish**.

## שלב 4 — התקן תלויות והרץ

פתח Terminal בתיקיית `moving-app` והרץ:

```bash
npm install
npm run dev
```

האפליקציה תיפתח בדפדפן ב-http://localhost:5173

## שלב 5 — פרוס ל-Vercel (חינם, כדי שהטלפונים יגיעו)

1. כנס ל-https://vercel.com → Sign up with Google (חינם)
2. לחץ **Add New Project** → Import from folder
   - לחלופין: `npm install -g vercel` ואז `vercel` מהתיקייה
3. Vercel ייתן לך URL כמו `https://moving-app-xxx.vercel.app`

## שלב 6 — הוסף את ה-URL ל-Firebase

ב-Firebase Console → Authentication → **Settings** → Authorized domains
→ לחץ **Add domain** → הדבק את כתובת ה-Vercel

## שלב 7 — התקן על הטלפון

1. פתח את ה-URL מהטלפון
2. התחבר עם Google
3. **iOS**: לחץ Share → "Add to Home Screen"
4. **Android**: לחץ על תפריט הדפדפן → "Add to Home Screen" / "Install App"

האפליקציה תופיע כאייקון על מסך הבית!

---

## שיתוף עם בת/בן הזוג

כרגע כל משתמש מחובר לנתונים שלו בנפרד.
כדי לשתף נתונים בין שניכם — שלח לי הודעה ואוסיף תמיכה בשיתוף (יצירת "בית" משותף עם קוד הזמנה).
