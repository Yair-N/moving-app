# Session Handoff — מעבר דירה PWA App — 2026-06-27

## What has been built
Complete Hebrew RTL moving-management PWA (React + Vite + Firebase) for Yair and his wife to share tasks and coordinate their apartment move. 5 screens + household sharing flow.

## Key context and constraints
- **Reference design:** https://liatnotko.my.canva.site/rtl — the app mirrors this layout. Cream bg `#f5f0eb`, navy `#2d4a6b` primary, terracotta `#c17f5a` secondary, RTL Hebrew throughout.
- **Firebase config is placeholder** — `src/firebase.js` has `"PASTE_YOUR_..."` values. App will crash on load until the user fills these in.
- The reference had 6 nav tabs; the "תוכנות" (far-left) tab was unclear and was omitted. The app has 5 tabs: לוח בקרה, דירות, ארזה, לוח, קניות.

## Completed in session 2
- **Household sharing implemented** — `src/screens/HouseholdSetup.jsx` shows after first login. User can "Create household" (gets a 6-char code) or "Join household" (enter partner's code). Data stored in `/users/{uid}/householdId` and `/households/{householdId}/meta/info`. All Firestore paths now use the shared `householdId` instead of `uid`.
- **`npm install` working** — downgraded Vite to ^6.3.0 and @vitejs/plugin-react to ^4.3.4 (vite-plugin-pwa doesn't support Vite 8 yet).
- **PWA icons created** — `public/icon-192.png` and `public/icon-512.png` with navy/cream/terracotta house design.
- **Deleted `src/App.css`** — leftover from Vite scaffold.

## Files in workspace
`C:\Users\yairn\OneDrive\Documents\Claude\Projects\מעבר דירה\moving-app\`

| File | Contents |
|------|----------|
| `package.json` | React 19, Firebase 11, Vite 6, vite-plugin-pwa |
| `index.html` | RTL Hebrew, PWA meta tags, apple-touch-icon |
| `vite.config.js` | Vite + React + VitePWA plugin with Hebrew manifest |
| `DEPLOY.md` | 7-step guide: Firebase setup → config → Firestore rules → dev → Vercel deploy → phone install |
| `src/firebase.js` | Firebase init, Google auth, Firestore export — **needs real config pasted in** |
| `src/main.jsx` | Standard React entry |
| `src/index.css` | Full custom CSS — all design tokens, components, RTL layout |
| `src/App.jsx` | Auth → HouseholdSetup → main app. Real-time Firestore listeners using shared householdId. Bottom nav, screen routing |
| `src/screens/HouseholdSetup.jsx` | Create/join household with 6-char invite code |
| `src/screens/Dashboard.jsx` | Countdown to move date, overall progress bar, urgent tasks widget, upcoming events |
| `src/screens/Apartments.jsx` | Toggle leaving/new apt, filter by his/hers/both, task CRUD with assignee + due date, contacts/installers CRUD |
| `src/screens/Packing.jsx` | Moving company details (auto-saves to Firestore meta doc), box tracker with room + fragile flag, box stats |
| `src/screens/CalendarScreen.jsx` | Add/delete events, grouped by month display |
| `src/screens/Shopping.jsx` | Items for sale/giveaway with marketplace tag, home shopping list with budget tracking |
| `public/icon-192.png` | PWA icon 192x192 — navy bg, cream house, terracotta door |
| `public/icon-512.png` | PWA icon 512x512 — same design |

## Remaining work
1. **Firebase config** — paste real credentials into `src/firebase.js` (blocker for running the app).
2. **Firestore security rules** — update to allow read/write only if `request.auth.uid` is in the household's `members` array.
3. **Optional polish:** notifications/reminders for due tasks, task reordering, photo upload for items for sale.

## Immediate next step
Paste Firebase credentials into `src/firebase.js`, then run `npm run dev` to test.
