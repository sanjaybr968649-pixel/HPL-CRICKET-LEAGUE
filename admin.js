// ============================================================
// HPL SEASON 11 - ADMIN.JS
// Firebase Login + Admin Panel
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
// FIREBASE CONFIG
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const DATA_REF = doc(db, "hpl", "data");


// ============================================================
// MAIN DATA
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

function $(id) {
  return document.getElementById(id);
}

function val(id) {
  const el = $(id);
  return el ? String(el.value || "").trim() : "";
}

function number(id) {
  const n = Number(val(id));
  return Number.isFinite(n) ? n : 0;
}

function cleanTeam(name) {
  const n = String(name || "").trim();

  if (n.toLowerCase() === "chesara") {
    return "Chasers";
  }

  return n;
}

function message(msg, error = false) {
  const status = $("status");

  if (status) {
    status.textContent = msg;
    status.style.color = error ? "#d93025" : "#16803c";
  }

  console.log(msg);
}


// ============================================================
// SAFE DATA NORMALIZATION
// ============================================================

function normalizeTeam(t) {
  if (!t || typeof t !== "object") return null;

  return {
    name: cleanTeam(t.name),
    logo: String(t.logo || ""),
    captain: String(t.captain || ""),
    ground: String(t.ground || "")
  };
}


function normalizePlayer(p) {
  if (!p || typeof p !== "object") return null;

  if (Array.isArray(p)) {
    return {
      name: String(p[0] || ""),
      short: String(p[1] || ""),
      team: cleanTeam(p[2]),
      place: String(p[3] || ""),
      role: String(p[4] || ""),
      batting: String(p[5] || ""),
      bowling: String(p[6] || ""),
      jersey: String(p[7] || ""),
      matches: Number(p[9]) || 0,
      runs: Number(p[10]) || 0,
      wickets: Number(p[11]) || 0,
      highest: Number(p[12]) || 0,
      fifties: Number(p[13]) || 0,
      hundreds: Number(p[14]) || 0
    };
  }

  return {
    name: String(p.name || ""),
    short: String(p.short || ""),
    team: cleanTeam(p.team),
    place: String(p.place || ""),
    role: String(p.role || ""),
    batting: String(p.batting || ""),
    bowling: String(p.bowling || ""),
    jersey: String(p.jersey || ""),
    matches: Number(p.matches) || 0,
    runs: Number(p.runs) || 0,
    wickets: Number(p.wickets) || 0,
    highest: Number(p.highest) || 0,
    fifties: Number(p.fifties) || 0,
    hundreds: Number(p.hundreds) || 0
  };
}


function normalizeMatch(m) {
  if (!m || typeof m !== "object") return null;

  if (Array.isArray(m)) {
    return {
      matchId: String(m[0] || ""),
      home: cleanTeam(m[1]),
      away: cleanTeam(m[2]),
      homeScore: parseScore(m[3]),
      awayScore: parseScore(m[4]),
      homeWickets: 0,
      awayWickets: 0,
      result: String(m[5] || ""),
      ground: String(m[6] || ""),
      performance: {}
    };
  }

  return {
    matchId: String(m.matchId || ""),
    home: cleanTeam(m.home),
    away: cleanTeam(m.away),
    homeScore: Number(m.homeScore) || 0,
    awayScore: Number(m.awayScore) || 0,
    homeWickets: Number(m.homeWickets) || 0,
    awayWickets: Number(m.awayWickets) || 0,
    result: String(m.result || ""),
    ground: String(m.ground || ""),
    performance: m.performance || {}
  };
}


function parseScore(value) {
  if (typeof value === "number") return value;

  const match = String(value || "").match(/\d+/);

  return match ? Number(match[0]) : 0;
}


function normalizePoint(p) {
  if (!p || typeof p !== "object") return null;

  if (Array.isArray(p)) {
    return {
      team: cleanTeam(p[0]),
      played: Number(p[1]) || 0,
      won: Number(p[2]) || 0,
      lost: Number(p[3]) || 0,
      points: Number(p[4]) || 0
    };
  }

  return {
    team: cleanTeam(p.team),
    played: Number(p.played) || 0,
    won: Number(p.won) || 0,
    lost: Number(p.lost) || 0,
    points: Number(p.points) || 0
  };
}


function normalizeData(data) {
  data = data || {};

  return {
    teams: Array.isArray(data.teams)
      ? data.teams.map(normalizeTeam).filter(Boolean)
      : [],

    players: Array.isArray(data.players)
      ? data.players.map(normalizePlayer).filter(Boolean)
      : [],

    matches: Array.isArray(data.matches)
      ? data.matches.map(normalizeMatch).filter(Boolean)
      : [],

    points: Array.isArray(data.points)
      ? data.points.map(normalizePoint).filter(Boolean)
      : [],

    scorecards:
      data.scorecards &&
      typeof data.scorecards === "object"
        ? data.scorecards
        : {}
  };
}


// ============================================================
// RENDER DASHBOARD
// ============================================================

function updateCounts() {
  if ($("teamCount"))
    $("teamCount").textContent = HPL.teams.length;

  if ($("playerCount"))
    $("playerCount").textContent = HPL.players.length;

  if ($("matchCount"))
    $("matchCount").textContent = HPL.matches.length;

  if ($("pointCount"))
    $("pointCount").textContent = HPL.points.length;
}


// ============================================================
// RENDER TEAMS
// ============================================================

function renderTeams() {
  const box = $("teamsList");
  if (!box) return;

  box.innerHTML = "";

  HPL.teams.forEach((team, index) => {
    const div = document.createElement("div");

    div.style.padding = "10px";
    div.style.marginBottom = "8px";
    div.style.border = "1px solid #ddd";
    div.style.borderRadius = "8px";

    div.innerHTML = `
      <strong>${escapeHTML(team.name)}</strong><br>
      Captain: ${escapeHTML(team.captain)}<br>
      Ground: ${escapeHTML(team.ground)}
    `;

    box.appendChild(div);
  });
}


// ============================================================
// RENDER PLAYERS
// ============================================================

function renderPlayers() {
  const box = $("playersList");
  if (!box) return;

  box.innerHTML = "";

  HPL.players.forEach(player => {
    const div = document.createElement("div");

    div.style.padding = "10px";
    div.style.marginBottom = "8px";
    div.style.border = "1px solid #ddd";
    div.style.borderRadius = "8px";

    div.innerHTML = `
      <strong>${escapeHTML(player.name)}</strong><br>
      Team: ${escapeHTML(player.team)}<br>
      Role: ${escapeHTML(player.role)}<br>
      Jersey: ${escapeHTML(player.jersey)}
    `;

    box.appendChild(div);
  });
}


// ============================================================
// RENDER MATCHES
// ============================================================

function renderMatches() {
  const box = $("matchesList");
  if (!box) return;

  box.innerHTML = "";

  HPL.matches.forEach(match => {
    const div = document.createElement("div");

    div.style.padding = "10px";
    div.style.marginBottom = "8px";
    div.style.border = "1px solid #ddd";
    div.style.borderRadius = "8px";

    div.innerHTML = `
      <strong>${escapeHTML(match.matchId)}</strong><br>
      ${escapeHTML(match.home)} ${match.homeScore}
      vs
      ${escapeHTML(match.away)} ${match.awayScore}<br>
      ${escapeHTML(match.result)}
    `;

    box.appendChild(div);
  });
}


// ============================================================
// RENDER POINTS
// ============================================================

function renderPoints() {
  const box = $("pointsList");
  if (!box) return;

  box.innerHTML = "";

  HPL.points.forEach(point => {
    const div = document.createElement("div");

    div.style.padding = "10px";
    div.style.marginBottom = "8px";
    div.style.border = "1px solid #ddd";
    div.style.borderRadius = "8px";

    div.innerHTML = `
      <strong>${escapeHTML(point.team)}</strong><br>
      Played: ${point.played} |
      Won: ${point.won} |
      Lost: ${point.lost} |
      Points: ${point.points}
    `;

    box.appendChild(div);
  });
}


// ============================================================
// SCORECARDS
// ============================================================

function renderScorecards() {
  const page = $("scorecardsPage");
  if (!page) return;

  let box = $("scorecardList");

  if (!box) {
    box = document.createElement("div");
    box.id = "scorecardList";
    page.appendChild(box);
  }

  box.innerHTML = "";

  Object.keys(HPL.scorecards || {}).forEach(id => {
    const div = document.createElement("div");

    div.style.padding = "10px";
    div.style.marginBottom = "8px";
    div.style.border = "1px solid #ddd";
    div.style.borderRadius = "8px";

    div.innerHTML = `<strong>${escapeHTML(id)}</strong>`;

    box.appendChild(div);
  });
}


// ============================================================
// RENDER ALL
// ============================================================

function renderAll() {
  updateCounts();
  renderTeams();
  renderPlayers();
  renderMatches();
  renderPoints();
  renderScorecards();
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ============================================================
// FIRESTORE LOAD
// ============================================================

async function loadData() {
  try {
    message("Loading data...");

    const snap = await getDoc(DATA_REF);

    if (snap.exists()) {
      HPL = normalizeData(snap.data());
      renderAll();

      message("Data loaded successfully.");
    } else {
      HPL = normalizeData(HPL);
      renderAll();

      message("No Firebase data found yet.");
    }

  } catch (error) {
    console.error(error);
    message("Load failed: " + error.message, true);
  }
}


// ============================================================
// FIRESTORE SAVE
// ============================================================

async function save
