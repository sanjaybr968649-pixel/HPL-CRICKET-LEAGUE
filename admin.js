// ======================================================
// HPL SEASON 11 - ADMIN PANEL
// Firebase + Login + Teams + Players + Matches
// Points + Player Stats + Scorecards
// ======================================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ======================================================
// FIREBASE CONFIG
// ======================================================

const firebaseConfig = {
  apiKey: "AIzaSyDW1MP5MBKoz6oOHxeWWHF7Ed8UGlsJsQ8",
  authDomain: "hpl-cricket-league.firebaseapp.com",
  projectId: "hpl-cricket-league",
  storageBucket: "hpl-cricket-league.firebasestorage.app",
  messagingSenderId: "310274398112",
  appId: "1:310274398112:web:4122ce31fb352d4f05b6c5",
  measurementId: "G-PPMME44H28"
};


// ======================================================
// FIREBASE
// ======================================================

let app;
let auth;
let db;
let dataRef;

try {

  app = initializeApp(firebaseConfig);

  auth = getAuth(app);

  db = getFirestore(app);

  dataRef = doc(db, "hpl", "data");

} catch (error) {

  console.error("Firebase initialization error:", error);

}


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

function num(value) {

  const n = Number(value);

  return Number.isFinite(n) ? n : 0;
}


function text(value) {

  return String(value ?? "").trim();

}


function safeJSON(value, fallback) {

  try {

    return JSON.parse(value);

  } catch {

    return fallback;

  }

}


function status(message, good = true) {

  const el = $("status");

  if (!el) return;

  el.textContent = message;

  el.style.color = good
    ? "#65ff9b"
    : "#ff6666";

}


// ======================================================
// FORCE CORRECT INITIAL SCREEN
// ======================================================

function showLogin() {

  const login = $("loginBox");
  const panel = $("adminPanel");

  if (login) {

    login.style.display = "flex";

  }

  if (panel) {

    panel.style.display = "none";

  }

}


function showAdmin() {

  const login = $("loginBox");
  const panel = $("adminPanel");

  if (login) {

    login.style.display = "none";

  }

  if (panel) {

    panel.style.display = "block";

  }

}


// ======================================================
// NORMALIZE PLAYER
// ======================================================
//
// [0] name
// [1] short
// [2] team
// [3] place
// [4] role
// [5] batting
// [6] bowling
// [7] jersey
// [8] matches
// [9] runs
// [10] 50s
// [11] 100s
// [12] highest
// [13] not-outs
// [14] wickets
//

function normalizePlayer(p) {

  if (Array.isArray(p)) {

    while (p.length < 15) {

      p.push(0);

    }

    return p;

  }

  if (p && typeof p === "object") {

    return [

      text(p.name),

      text(p.short),

      text(p.team),

      text(p.place),

      text(p.role),

      text(p.batting),

      text(p.bowling),

      text(p.jersey),

      num(p.matches),

      num(p.runs),

      num(p.fifties),

      num(p.hundreds),

      num(p.highest),

      num(p.notOuts),

      num(p.wickets)

    ];

  }

  return [

    "", "", "", "", "", "", "", "",

    0, 0, 0, 0, 0, 0, 0

  ];

}


// ======================================================
// NORMALIZE MATCH
// ======================================================

function normalizeMatch(m) {

  if (Array.isArray(m)) {

    return {

      matchId: text(m[0]),

      home: text(m[1]),

      away: text(m[2]),

      homeScore: num(m[3]),

      awayScore: num(m[4]),

      result: text(m[5]),

      ground: text(m[6]),

      homeWickets: num(m[7]),

      awayWickets: num(m[8]),

      performance: Array.isArray(m[9])
        ? m[9]
        : []

    };

  }

  return {

    matchId: text(m?.matchId),

    home: text(m?.home),

    away: text(m?.away),

    homeScore: num(m?.homeScore),

    awayScore: num(m?.awayScore),

    result: text(m?.result),

    ground: text(m?.ground),

    homeWickets: num(m?.homeWickets),

    awayWickets: num(m?.awayWickets),

    performance: Array.isArray(m?.performance)
      ? m.performance
      : []

  };

}


// ======================================================
// LOAD FIRESTORE
// ======================================================

async function loadData() {

  if (!dataRef) {

    status("Firebase is not initialized.", false);

    return;

  }

  try {

    status("Loading HPL data...");

    const snap = await getDoc(dataRef);

    if (snap.exists()) {

      const data = snap.data();

      HPL = {

        teams: Array.isArray(data.teams)
          ? data.teams
          : [],

        players: Array.isArray(data.players)
          ? data.players.map(normalizePlayer)
          : [],

        matches: Array.isArray(data.matches)
          ? data.matches.map(normalizeMatch)
          : [],

        points: Array.isArray(data.points)
          ? data.points
          : [],

        scorecards:
          data.scorecards &&
          typeof data.scorecards === "object"
            ? data.scorecards
            : {}

      };

    }

    renderAll();

    status("✅ HPL data loaded.");

  } catch (error) {

    console.error(error);

    status(
      "❌ Could not load data: " + error.message,
      false
    );

  }

}


// ======================================================
// SAVE FIRESTORE
// ======================================================

async function saveData() {

  if (!dataRef) {

    status("Firebase is not initialized.", false);

    return;

  }

  try {

    await setDoc(dataRef, {

      teams: HPL.teams,

      players: HPL.players,

      matches: HPL.matches,

      points: HPL.points,

      scorecards: HPL.scorecards

    });

    status("✅ HPL data saved to Firebase.");

  } catch (error) {

    console.error(error);

    status(
      "❌ Save failed: " + error.message,
      false
    );

  }

}


// ======================================================
// LOGIN
// ======================================================

async function login() {

  const email = text($("email")?.value);

  const password = $("password")?.value || "";

  const msg = $("loginMsg");

  if (!email || !password) {

    if (msg) {

      msg.textContent =
        "Enter email and password.";

    }

    return;

  }

  if (!auth) {

    if (msg) {

      msg.textContent =
        "Firebase could not start.";

    }

    return;

  }

  try {

    if (msg) {

      msg.textContent = "Logging in...";

    }

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  } catch (error) {

    console.error(error);

    if (msg) {

      msg.textContent =
        error.message;

    }

  }

}


// ======================================================
// LOGOUT
// ======================================================

async function logout() {

  if (!auth) return;

  try {

    await signOut(auth);

  } catch (error) {

    console.error(error);

  }

}


// ======================================================
// TABS
// ======================================================

function setupTabs() {

  document.querySelectorAll(".tab")
    .forEach(button => {

      button.addEventListener("click", () => {

        document.querySelectorAll(".tab")
          .forEach(b =>
            b.classList.remove("active")
          );

        document.querySelectorAll(".page")
          .forEach(p =>
            p.classList.remove("active")
          );

        button.classList.add("active");

        const page =
          $(button.dataset.page);

        if (page) {

          page.classList.add("active");

        }

      });

    });

}


// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard() {

  if ($("teamCount")) {

    $("teamCount").textContent =
      HPL.teams.length;

  }

  if ($("playerCount")) {

    $("playerCount").textContent =
      HPL.players.length;

  }

  if ($("matchCount")) {

    $("matchCount").textContent =
      HPL.matches.length;

  }

  if ($("seasonCount")) {

    $("seasonCount").textContent = "11";

  }

}


// ======================================================
// TEAMS
// ======================================================

function renderTeams() {

  const box = $("teamsList");

  if (!box) return;

  box.innerHTML = "";

  if (!HPL.teams.length) {

    box.innerHTML =
      "<p>No teams added yet.</p>";

    return;

  }

  HPL.teams.forEach((team, index) => {

    const div =
      document.createElement("div");

    div.className = "item";

    div.innerHTML = `

      <div>

        <strong>
          ${escapeHTML(team.name)}
        </strong>

        <br>

        Captain:
        ${escapeHTML(team.captain)}

        <br>

        Ground:
        ${escapeHTML(team.ground)}

      </div>

      <button class="delete">
        DELETE
      </button>

    `;

    div.querySelector("button")
      .onclick = async () => {

        if (!confirm(
          "Delete this team?"
        )) return;

        HPL.teams.splice(index, 1);

        renderAll();

        await saveData();

      };

    box.appendChild(div);

  });

}


function addTeam() {

  const team = {

    name: text($("teamName")?.value),

    logo: text($("teamLogo")?.value),

    captain: text($("teamCaptain")?.value),

    ground: text($("teamGround")?.value)

  };

  if (!team.name) {

    status(
      "Enter team name.",
      false
    );

    return;

  }

  HPL.teams.push(team);

  $("teamName").value = "";
  $("teamLogo").value = "";
  $("teamCaptain").value = "";
  $("teamGround").value = "";

  renderAll();

  saveData();

}


// ======================================================
// PLAYERS
// ======================================================

function renderPlayers() {

  const box = $("playersList");

  if (!box) return;

  box.innerHTML = "";

  if (!HPL.players.length) {

    box.innerHTML =
      "<p>No players added yet.</p>";

    return;

  }

  HPL.players.forEach((p, index) => {

    p = normalizePlayer(p);

    const div =
      document.createElement("div");

    div.className = "item";

    div.innerHTML = `

      <div>

        <strong>
          ${escapeHTML(p[0])}
        </strong>

        <br>

        ${escapeHTML(p[4])}

        <br>

        ${escapeHTML(p[5])}
        •
        ${escapeHTML(p[6])}

        <br>

        Season 11:
        ${p[8]} Matches •
        ${p[9]} Runs •
        ${p[10]} 50s •
        ${p[11]} 100s •
        Best ${p[12]} •
        ${p[13]} NO •
        ${p[14]} Wickets

      </div>

      <button class="delete">
        DELETE
      </button>

    `;

    div.querySelector("button")
      .onclick = async () => {

        if (!confirm(
          "Delete this player?"
        )) return;

        HPL.players.splice(index, 1);

        renderAll();

        await saveData();

      };

    box.appendChild(div);

  });

}


function addPlayer() {

  const p = [

    text($("playerName")?.value),

    text($("playerShort")?.value),

    text($("playerTeam")?.value),

    text($("playerf
