// ======================================================
// HPL ADMIN PANEL - FINAL VERSION
// Firebase + Teams + Players + Matches + Points + Stats
// ======================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ======================================================
// FIREBASE CONFIG
// ======================================================

const firebaseConfig = {
  apiKey: "AIzaSyB3QY7HqJ7q9Q7fJXxq8mYQ0QxQ0QxQ0Qx",
  authDomain: "hpl-cricket-league.firebaseapp.com",
  projectId: "hpl-cricket-league",
  storageBucket: "hpl-cricket-league.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};


// ======================================================
// FIREBASE INITIALIZE
// ======================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const dataRef = doc(db, "hpl", "data");


// ======================================================
// HPL DATA
// ======================================================

let HPL = {
  teams: [],
  players: [],
  matches: [],
  points: [],
  scorecards: {}
};


// ======================================================
// HELPERS
// ======================================================

const $ = id => document.getElementById(id);

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function clean(value) {
  return String(value ?? "").trim();
}

function showStatus(message, success = true) {
  const el = $("status");

  if (!el) return;

  el.textContent = message;
  el.style.color = success ? "#00ff88" : "#ff5555";
}


// ======================================================
// PLAYER ARRAY NORMALIZATION
//
// [0]  name
// [1]  short
// [2]  team
// [3]  place
// [4]  role
// [5]  batting
// [6
