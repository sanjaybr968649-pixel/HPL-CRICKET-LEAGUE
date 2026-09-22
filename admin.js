// ============================================================
// HPL SEASON 11 - FINAL ADMIN.JS
// Firebase + Existing Public HPL Data Migration
// ============================================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// ============================================================
// FIREBASE
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDW1MP5MBKoz6oOHxeWWHF7Ed8UGlsJsQ8",
  authDomain: "hpl-cricket-league.firebaseapp.com",
  projectId: "hpl-cricket-league",
  storageBucket: "hpl-cricket-league.firebasestorage.app",
  messagingSenderId: "310274398112",
  appId: "1:310274398112:web:4122ce31fb352d4f05b6c5",
  measurementId: "G-PPMME44H28"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const DATA_REF = doc(db, "hpl", "data");


// ============================================================
// DATA
// ============================================================

let HPL = {
  teams: [],
  players: [],
  matches: [],
  points: [],
  scorecards: {}
};


// ============================================================
// HELPERS
// ============================================================

const $ = id => document.getElementById(id);

function text(value) {
  return String(value ?? "").trim();
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function teamName(value) {
  const name = text(value);

  if (name.toLowerCase() === "chesara") {
    return "Chasers";
  }

  return name;
}

function showStatus(message, error = false) {
  const el = $("status");

  if (el) {
    el.textContent = message;
    el.style.color = error ? "#d93025" : "#16803c";
  }

  console.log(message);
}


// ============================================================
// PLAYER NORMALIZATION
// ============================================================

function normalizePlayer(p) {

  if (!Array.isArray(p)) {
    return {
      name: text(p.name),
      short: text(p.short),
      team: teamName(p.team),
      place: text(p.place),
      role: text(p.role),
      batting: text(p.batting),
      bowling: text(p.bowling),
      jersey: text(p.jersey),
      matches: num(p.matches),
      runs: num(p.runs),
      wickets: num(p.wickets),
      highest: num(p.highest),
      fifties: num(p.fifties),
      hundreds: num(p.hundreds)
    };
  }

  return {
    name: text(p[0]),
    short: text(p[1]),
    team: teamName(p[2]),
    place: text(p[3]),
    role: text(p[4]),
    batting: text(p[5]),
    bowling: text(p[6]),
    jersey: text(p[7]),

    matches: num(p[9]),
    runs: num(p[10]),
    wickets: num(p[11]),
    highest: num(p[12]),
    fifties: num(p[13]),
    hundreds: num(p[14])
  };
}


// ============================================================
// TEAM NORMALIZATION
// ============================================================

function normalizeTeam(t) {
  return {
    name: teamName(t.name),
    logo: text(t.logo),
    captain: text(t.captain),
    ground: text(t.ground)
  };
}


// ============================================================
// MATCH NORMALIZATION
// ============================================================

function scoreNumber(value) {
  if (typeof value === "number") return value;

  const match = text(value).match(/\d+/);
  return match ? num(match[0]) : 0;
}

function normalizeMatch(m) {

  if (!Array.isArray(m)) {
    return {
      matchId: text(m.matchId),
      home: teamName(m.home),
      away: teamName(m.away),
      homeScore: num(m.homeScore),
      awayScore: num(m.awayScore),
      homeWickets: num(m.homeWickets),
      awayWickets: num(m.awayWickets),
      result: text(m.result),
      ground: text(m.ground),
      performance: m.performance || {}
    };
  }

  return {
    matchId: text(m[0]),
    home: teamName(m[1]),
    away: teamName(m[2]),
    homeScore: scoreNumber(m[3]),
    awayScore: scoreNumber(m[4]),
    homeWickets: 0,
    awayWickets: 0,
    result: text(m[5]),
    ground: text(m[6]),
    performance: {}
  };
}


// ============================================================
// POINTS NORMALIZATION
// ============================================================

function normalizePoint(p) {

  if (!Array.isArray(p)) {
    return {
      team: teamName(p.team),
      played: num(p.played),
      won: num(p.won),
      lost: num(p.lost),
      points: num(p.points)
    };
  }

  return {
    team: teamName(p[0]),
    played: num(p[1]),
    won: num(p[2]),
    lost: num(p[3]),
    points: num(p[4])
  };
}


// ============================================================
// NORMALIZE WHOLE DATASET
// ============================================================

function normalizeData(data) {

  return {
    teams: Array.isArray(data?.teams)
      ? data.teams.map(normalizeTeam)
      : [],

    players: Array.isArray(data?.players)
      ? data.players.map(normalizePlayer)
      : [],

    matches: Array.isArray(data?.matches)
      ? data.matches.map(normalizeMatch)
      : [],

    points: Array.isArray(data?.points)
      ? data.points.map(normalizePoint)
      : [],

    scorecards:
      data?.scorecards &&
      typeof data.scorecards === "object"
        ? data.scorecards
        : {}
  };
}


// ============================================================
// GET HPL OBJECT FROM PUBLIC APP.JS
// ============================================================

function getHPLText(source) {

  const match = source.match(
    /(?:const|let|var)\s+HPL\s*=\s*\{/
  );

  if (!match) {
    throw new Error("HPL data not found in app.js");
  }

  const start =
    match.index + match[0].lastIndexOf("{");

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let i = start; i < source.length; i++) {

    const ch = source[i];

    if (quote) {

      if (escaped) {
        escaped = false;
        continue;
      }

      if (ch === "\\") {
        escaped = true;
        continue;
      }

      if (ch === quote) {
        quote = null;
      }

      continue;
    }

    if (
      ch === "'" ||
      ch === '"' ||
      ch === "`"
