// =============================================
// STEP 1: Replace these values with YOUR Firebase project config
// Get them from: Firebase Console → Project Settings → Your Apps → Web App
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCCcfRiLwB5w2qPBia54rTRU3Uv9I4p_1Q",
  authDomain: "iitp-complaints.firebaseapp.com",
  projectId: "iitp-complaints",
  storageBucket: "iitp-complaints.firebasestorage.app",
  messagingSenderId: "207725769847",
  appId: "1:207725769847:web:0b319f84c717fa467d0272"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
