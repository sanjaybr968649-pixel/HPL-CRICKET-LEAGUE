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

async function saveData() {
  try {
    message("Saving data...");

    HPL = normalizeData(HPL);

    await setDoc(DATA_REF, HPL);

    renderAll();

    message("Data saved successfully.");

  } catch (error) {
    console.error(error);
    message("Save failed: " + error.message, true);
  }
}


// ============================================================
// ADD TEAM
// ============================================================

function addTeam() {
  const name = val("teamName");

  if (!name) {
    message("Enter team name.", true);
    return;
  }

  const team = {
    name: cleanTeam(name),
    logo: val("teamLogo"),
    captain: val("teamCaptain"),
    ground: val("teamGround")
  };

  const exists = HPL.teams.some(
    t => t.name.toLowerCase() === team.name.toLowerCase()
  );

  if (exists) {
    message("Team already exists.", true);
    return;
  }

  HPL.teams.push(team);

  renderAll();

  $("teamName").value = "";
  $("teamLogo").value = "";
  $("teamCaptain").value = "";
  $("teamGround").value = "";

  message("Team added.");
}


// ============================================================
// ADD PLAYER
// ============================================================

function addPlayer() {
  const name = val("playerName");

  if (!name) {
    message("Enter player name.", true);
    return;
  }

  HPL.players.push({
    name,
    short: val("playerShort"),
    team: cleanTeam(val("playerTeam")),
    place: val("playerPlace"),
    role: val("playerRole"),
    batting: val("playerBatting"),
    bowling: val("playerBowling"),
    jersey: val("playerJersey"),
    matches: 0,
    runs: 0,
    wickets: 0,
    highest: 0,
    fifties: 0,
    hundreds: 0
  });

  renderAll();

  [
    "playerName",
    "playerShort",
    "playerTeam",
    "playerPlace",
    "playerRole",
    "playerBatting",
    "playerBowling",
    "playerJersey"
  ].forEach(id => {
    if ($(id)) $(id).value = "";
  });

  message("Player added.");
}


// ============================================================
// ADD MATCH
// ============================================================

function addMatch() {
  const id = val("matchId");

  if (!id) {
    message("Enter match ID.", true);
    return;
  }

  HPL.matches.push({
    matchId: id,
    home: cleanTeam(val("matchHome")),
    away: cleanTeam(val("matchAway")),
    homeScore: number("matchHomeScore"),
    awayScore: number("matchAwayScore"),
    homeWickets: number("matchHomeWickets"),
    awayWickets: number("matchAwayWickets"),
    result: val("matchResult"),
    ground: val("matchGround"),
    performance: {}
  });

  renderAll();

  [
    "matchId",
    "matchHome",
    "matchAway",
    "matchHomeScore",
    "matchAwayScore",
    "matchHomeWickets",
    "matchAwayWickets",
    "matchResult",
    "matchGround"
  ].forEach(id => {
    if ($(id)) $(id).value = "";
  });

  message("Match added.");
}


// ============================================================
// ADD POINT
// ============================================================

function addPoint() {
  const team = val("pointTeam");

  if (!team) {
    message("Enter team name.", true);
    return;
  }

  HPL.points.push({
    team: cleanTeam(team),
    played: number("pointPlayed"),
    won: number("pointWon"),
    lost: number("pointLost"),
    points: number("pointPoints")
  });

  renderAll();

  [
    "pointTeam",
    "pointPlayed",
    "pointWon",
    "pointLost",
    "pointPoints"
  ].forEach(id => {
    if ($(id)) $(id).value = "";
  });

  message("Points added.");
}


// ============================================================
// SAVE SCORECARD
// ============================================================

function saveScorecard() {
  const json = val("scorecardJSON");

  if (!json) {
    message("Enter scorecard JSON.", true);
    return;
  }

  try {
    const data = JSON.parse(json);

    const id =
      data.matchId ||
      data.id ||
      "M" + (Object.keys(HPL.scorecards).length + 1);

    HPL.scorecards[id] = data;

    renderAll();

    message("Scorecard added.");

  } catch (error) {
    message("Invalid JSON.", true);
  }
}


// ============================================================
// LOGIN
// ============================================================

async function login() {
  const email = val("email");
  const password = $("password")
    ? $("password").value
    : "";

  const loginMsg = $("loginMsg");

  if (loginMsg) {
    loginMsg.style.color = "#d93025";
  }

  if (!email || !password) {
    if (loginMsg) {
      loginMsg.textContent =
        "Email and password enter madi.";
    }

    return;
  }

  if (loginMsg) {
    loginMsg.textContent = "Logging in...";
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (loginMsg) {
      loginMsg.textContent = "";
    }

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    let msg = "Login failed.";

    if (error.code === "auth/invalid-credential") {
      msg = "Email athava password sari illa.";
    }

    else if (error.code === "auth/invalid-email") {
      msg = "Email format sari illa.";
    }

    else if (error.code === "auth/user-not-found") {
      msg = "Ee email Firebase Authentication alli illa.";
    }

    else if (error.code === "auth/wrong-password") {
      msg = "Password sari illa.";
    }

    else if (error.code === "auth/too-many-requests") {
      msg = "Too many attempts. Swalpa time bittu try madi.";
    }

    else if (error.code === "auth/network-request-failed") {
      msg = "Internet connection check madi.";
    }

    else {
      msg = error.message || "Login failed.";
    }

    if (loginMsg) {
      loginMsg.textContent = msg;
    }
  }
}


// ============================================================
// AUTH STATE
// ============================================================

onAuthStateChanged(auth, user => {

  const loginScreen = $("loginScreen");
  const adminScreen = $("adminScreen");

  if (user) {

    if (loginScreen) {
      loginScreen.style.display = "none";
    }

    if (adminScreen) {
      adminScreen.style.display = "block";
    }

    message("Logged in as " + user.email);

    loadData();

  } else {

    if (loginScreen) {
      loginScreen.style.display = "block";
    }

    if (adminScreen) {
      adminScreen.style.display = "none";
    }
  }
});


// ============================================================
// LOGOUT
// ============================================================

async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
}


// ============================================================
// TABS
// ============================================================

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");

  tabs.forEach(tab => {

    tab.addEventListener("click", () => {

      const pageName =
        tab.getAttribute("data-page");

      document
        .querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));

      tab.classList.add("active");

      document
        .querySelectorAll(".page")
        .forEach(page => {
          page.style.display = "none";
        });

      const page = $(pageName);

      if (page) {
        page.style.display = "block";
      }
    });
  });
}


// ============================================================
// BUTTON EVENTS
// ============================================================

function setupButtons() {

  if ($("loginBtn")) {
    $("loginBtn").addEventListener(
      "click",
      login
    );
  }

  if ($("logoutBtn")) {
    $("logoutBtn").addEventListener(
      "click",
      logout
    );
  }

  if ($("loadBtn")) {
    $("loadBtn").addEventListener(
      "click",
      loadData
    );
  }

  if ($("saveBtn")) {
    $("saveBtn").addEventListener(
      "click",
      saveData
    );
  }

  if ($("addTeamBtn")) {
    $("addTeamBtn").addEventListener(
      "click",
      addTeam
    );
  }

  if ($("addPlayerBtn")) {
    $("addPlayerBtn").addEventListener(
      "click",
      addPlayer
    );
  }

  if ($("addMatchBtn")) {
    $("addMatchBtn").addEventListener(
      "click",
      addMatch
    );
  }

  if ($("addPointBtn")) {
    $("addPointBtn").addEventListener(
      "click",
      addPoint
    );
  }

  if ($("saveScorecardBtn")) {
    $("saveScorecardBtn").addEventListener(
      "click",
      saveScorecard
    );
  }
}


// ============================================================
// START
// ============================================================

setupButtons();
setupTabs();

console.log("HPL ADMIN.JS LOADED SUCCESSFULLY");
