# IITP Campus Complaint Tracker
## Setup Guide — Firebase + Vercel

---

## Step 1: Firebase Setup (5 min)

1. Go to https://console.firebase.google.com
2. Click **"Add project"** → Name it `iitp-complaints` → Continue
3. Disable Google Analytics (not needed) → Create project

### Enable Authentication
4. Left menu → **Build → Authentication → Get started**
5. Click **"Email/Password"** → Enable → Save

### Enable Firestore Database
6. Left menu → **Build → Firestore Database → Create database**
7. Select **"Start in production mode"** → Next → Choose region (asia-south1) → Enable

### Apply Security Rules
8. In Firestore → click **"Rules"** tab
9. Delete existing content, paste contents of `firestore.rules` file → Publish

### Get Your Config Keys
10. Top left gear icon → **Project Settings**
11. Scroll down to **"Your apps"** → click `</>` (Web app)
12. Register app name as `iitp-complaints-web` → Continue
13. Copy the `firebaseConfig` object values

---

## Step 2: Add Your Firebase Keys (2 min)

Open `js/firebase-config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",           // paste your key
  authDomain: "iitp-complaints.firebaseapp.com",
  projectId: "iitp-complaints",
  storageBucket: "iitp-complaints.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456:web:abcdef"
};
```

---

## Step 3: Deploy on Vercel (3 min)

1. Go to https://github.com → Create new repo → `iitp-complaints`
2. Upload all project files (index.html, css/, js/, firestore.rules)
3. Go to https://vercel.com → Sign up with GitHub
4. Click **"New Project"** → Import your repo
5. Leave all settings default → Click **Deploy**
6. Your site is LIVE at `iitp-complaints.vercel.app` 🎉

---

## File Structure

```
iitp-complaints/
├── index.html              ← Main app (single page)
├── css/
│   └── style.css           ← All styles
├── js/
│   ├── firebase-config.js  ← YOUR FIREBASE KEYS GO HERE
│   └── app.js              ← All logic (auth, firestore, UI)
└── firestore.rules         ← Security rules (paste in Firebase)
```

---

## Features

- Login / Register with **@iitp.ac.in** email only
- Submit complaints with category, priority, description, location
- Dashboard with stats (Total / Pending / In Progress / Resolved)
- My Complaints — view only your complaints
- All Complaints — see everyone's, filter by status
- Data stored in Firestore (real-time, free tier)

---

## Notes

- Free Firebase Spark plan is enough for college use
- Vercel free plan = unlimited hobby deployments
- To get a custom domain like `complaints.iitp.ac.in` → ask your college IT dept for DNS access
