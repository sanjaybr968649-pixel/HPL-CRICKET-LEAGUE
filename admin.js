// HPL SEASON 11 - SIMPLE STABLE ADMIN PANEL
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
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
const auth = getAuth(app);
const db = getFirestore(app);
const dataRef = doc(db, "hpl", "data");

let HPL = {
  teams: [],
  players: [],
  matches: [],
  points: [],
  scorecards: {}
};

const $ = id => document.getElementById(id);

function esc(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function show(id, yes) {
  $(id)?.classList.toggle("hidden", !yes);
}

function status(message, error = false) {
  const el = $("status");
  if (el) {
    el.textContent = message;
    el.style.color = error ? "#dc2626" : "#16a34a";
  }
}

function loginMessage(message) {
  $("loginMsg").textContent = message;
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      $(tab.dataset.page)?.classList.add("active");
    });
  });
}

async function login() {
  const email = $("email").value.trim();
  const password = $("password").value;

  if (!email || !password) {
    loginMessage("Enter email and password.");
    return;
  }

  try {
    loginMessage("Logging in...");
    await signInWithEmailAndPassword(auth, email, password);
    loginMessage("");
  } catch (error) {
    console.error(error);
    loginMessage(error.message || "Login failed.");
  }
}

async function loadData() {
  try {
    status("Loading...");
    const snap = await getDoc(dataRef);

    if (snap.exists()) {
      const data = snap.data();
      HPL = {
        teams: Array.isArray(data.teams) ? data.teams : [],
        players: Array.isArray(data.players) ? data.players : [],
        matches: Array.isArray(data.matches) ? data.matches : [],
        points: Array.isArray(data.points) ? data.points : [],
        scorecards: data.scorecards && typeof data.scorecards === "object" ? data.scorecards : {}
      };
    }

    renderAll();
    status("Data loaded.");
  } catch (error) {
    console.error(error);
    status(error.message || "Could not load data.", true);
  }
}

async function saveData() {
  try {
    status("Saving...");
    await setDoc(dataRef, HPL);
    status("Saved successfully.");
  } catch (error) {
    console.error(error);
    status(error.message || "Could not save data.", true);
  }
}

function renderAll() {
  $("teamCount").textContent = HPL.teams.length;
  $("playerCount").textContent = HPL.players.length;
  $("matchCount").textContent = HPL.matches.length;
  $("pointCount").textContent = HPL.points.length;

  renderTeams();
  renderPlayers();
  renderMatches();
  renderPoints();
}

function renderTeams() {
  const box = $("teamsList");
  box.innerHTML = "";

  HPL.teams.forEach((team, i) => {
    const name = Array.isArray(team) ? team[0] : team.name;
    const logo = Array.isArray(team) ? team[1] : team.logo;
    const captain = Array.isArray(team) ? team[2] : team.captain;
    const ground = Array.isArray(team) ? team[3] : team.ground;

    box.innerHTML += `
      <div class="item">
        <div>
          <b>${esc(name)}</b><br>
          Captain: ${esc(captain)}<br>
          Ground: ${esc(ground)}<br>
          Logo: ${esc(logo)}
        </div>
        <button class="delete" data-delete-team="${i}">DELETE</button>
      </div>`;
  });

  box.querySelectorAll("[data-delete-team]").forEach(btn => {
    btn.onclick = () => {
      HPL.teams.splice(Number(btn.dataset.deleteTeam), 1);
      renderAll();
    };
  });
}

function renderPlayers() {
  const box = $("playersList");
  box.innerHTML = "";

  HPL.players.forEach((p, i) => {
    const player = Array.isArray(p) ? p : [
      p.name,p.short,p.team,p.place,p.role,p.batting,p.bowling,p.jersey,
      p.matches || 0,p.runs || 0,p.fifties || 0,p.hundreds || 0,
      p.highest || 0,p.notOuts || 0,p.wickets || 0
    ];

    box.innerHTML += `
      <div class="item">
        <div>
          <b>${esc(player[0])}</b> — ${esc(player[4])}<br>
          ${esc(player[2])} | ${esc(player[3])} | Jersey ${esc(player[7])}<br>
          Matches: ${player[8] || 0} | Runs: ${player[9] || 0} | Wickets: ${player[14] || 0}
        </div>
        <button class="delete" data-delete-player="${i}">DELETE</button>
      </div>`;
  });

  box.querySelectorAll("[data-delete-player]").forEach(btn => {
    btn.onclick = () => {
      HPL.players.splice(Number(btn.dataset.deletePlayer), 1);
      renderAll();
    };
  });
}

function renderMatches() {
  const box = $("matchesList");
  box.innerHTML = "";

  HPL.matches.forEach((m, i) => {
    const a = Array.isArray(m) ? m : [
      m.id,m.home,m.away,m.homeScore,m.awayScore,m.result,m.ground,
      m.homeWickets,m.awayWickets,m.performance
    ];

    box.innerHTML += `
      <div class="item">
        <div>
          <b>${esc(a[0])}</b>: ${esc(a[1])} vs ${esc(a[2])}<br>
          Score: ${a[3] ?? 0}/${a[7] ?? 0} — ${a[4] ?? 0}/${a[8] ?? 0}<br>
          Result: ${esc(a[5])} | Ground: ${esc(a[6])}
        </div>
        <button class="delete" data-delete-match="${i}">DELETE</button>
      </div>`;
  });

  box.querySelectorAll("[data-delete-match]").forEach(btn => {
    btn.onclick = () => {
      HPL.matches.splice(Number(btn.dataset.deleteMatch), 1);
      recalculatePoints();
      renderAll();
    };
  });
}

function renderPoints() {
  const box = $("pointsList");
  box.innerHTML = "";

  HPL.points.forEach((p, i) => {
    const a = Array.isArray(p) ? p : [p.team,p.played,p.won,p.lost,p.points,p.for || 0,p.against || 0];
    const nrr = Number(a[5] || 0) - Number(a[6] || 0);

    box.innerHTML += `
      <div class="item">
        <div>
          <b>${esc(a[0])}</b><br>
          P: ${a[1] || 0} | W: ${a[2] || 0} | L: ${a[3] || 0} | Points: ${a[4] || 0}<br>
          NRR: ${nrr}
        </div>
        <button class="delete" data-delete-point="${i}">DELETE</button>
      </div>`;
  });

  box.querySelectorAll("[data-delete-point]").forEach(btn => {
    btn.onclick = () => {
      HPL.points.splice(Number(btn.dataset.deletePoint), 1);
      renderAll();
    };
  });
}

function addTeam() {
  const name = $("teamName").value.trim();
  if (!name) return alert("Enter team name.");

  HPL.teams.push([
    name,
    $("teamLogo").value.trim(),
    $("teamCaptain").value.trim(),
    $("teamGround").value.trim()
  ]);

  ["teamName","teamLogo","teamCaptain","teamGround"].forEach(id => $(id).value = "");
  renderAll();
}

function addPlayer() {
  const name = $("playerName").value.trim();
  if (!name) return alert("Enter player name.");

  HPL.players.push([
    name,
    $("playerShort").value.trim(),
    $("playerTeam").value.trim(),
    $("playerPlace").value.trim(),
    $("playerRole").value.trim(),
    $("playerBatting").value.trim(),
    $("playerBowling").value.trim(),
    $("playerJersey").value.trim(),
    0,0,0,0,0,0,0
  ]);

  ["playerName","playerShort","playerTeam","playerPlace","playerRole","playerBatting","playerBowling","playerJersey"]
    .forEach(id => $(id).value = "");

  renderAll();
}

function parsePerformance(text) {
  if (!text.trim()) return [];

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error("Performance must be an array.");
    return parsed;
  } catch (error) {
    alert("Invalid performance JSON.");
    return null;
  }
}

function findPlayer(name) {
  return HPL.players.find(p => Array.isArray(p) && p[0].toLowerCase() === name.toLowerCase());
}

function applyPerformance(performance, direction = 1) {
  if (!Array.isArray(performance)) return;

  performance.forEach(stat => {
    const player = findPlayer(stat.name || "");
    if (!player) return;

    const runs = Number(stat.runs || 0) * direction;
    const wickets = Number(stat.wickets || 0) * direction;
    const matches = Number(stat.matches ?? 1) * direction;

    player[8] = Math.max(0, Number(player[8] || 0) + matches);
    player[9] = Math.max(0, Number(player[9] || 0) + runs);
    player[14] = Math.max(0, Number(player[14] || 0) + wickets);

    if (direction > 0) {
      if (Number(stat.runs || 0) >= 100) player[11] = Number(player[11] || 0) + 1;
      else if (Number(stat.runs || 0) >= 50) player[10] = Number(player[10] || 0) + 1;

      if (Number(stat.runs || 0) > Number(player[12] || 0)) {
        player[12] = Number(stat.runs || 0);
      }

      if (stat.notOut) player[13] = Number(player[13] || 0) + 1;
    } else {
      if (Number(stat.runs || 0) >= 100) player[11] = Math.max(0, Number(player[11] || 0) - 1);
      else if (Number(stat.runs || 0) >= 50) player[10] = Math.max(0, Number(player[10] || 0) - 1);
      if (stat.notOut) player[13] = Math.max(0, Number(player[13] || 0) - 1);
    }
  });
}

function addOrUpdateMatch() {
  const id = $("matchId").value.trim();
  if (!id) return alert("Enter Match ID.");

  const performance = parsePerformance($("matchPerformance").value);
  if (performance === null) return;

  const newMatch = [
    id,
    $("matchHome").value.trim(),
    $("matchAway").value.trim(),
    Number($("matchHomeScore").value || 0),
    Number($("matchAwayScore").value || 0),
    $("matchResult").value.trim(),
    $("matchGround").value.trim(),
    Number($("matchHomeWickets").value || 0),
    Number($("matchAwayWickets").value || 0),
    performance
  ];

  const index = HPL.matches.findIndex(m => Array.isArray(m) && m[0] === id);

  if (index >= 0) {
    const old = HPL.matches[index];
    applyPerformance(old[9] || [], -1);
    HPL.matches[index] = newMatch;
  } else {
    HPL.matches.push(newMatch);
  }

  applyPerformance(performance, 1);
  recalculatePoints();
  renderAll();

  ["matchId","matchHome","matchAway","matchHomeScore","matchAwayScore",
   "matchHomeWickets","matchAwayWickets","matchResult","matchGround","matchPerformance"]
   .forEach(id => $(id).value = "");
}

function recalculatePoints() {
  const map = {};

  HPL.teams.forEach(t => {
    const name = Array.isArray(t) ? t[0] : t.name;
    map[name] = {played:0,won:0,lost:0,points:0,for:0,against:0};
  });

  HPL.matches.forEach(m => {
    if (!Array.isArray(m)) return;

    const home = m[1], away = m[2];
    const hs = Number(m[3] || 0), as = Number(m[4] || 0);
    if (!map[home]) map[home] = {played:0,won:0,lost:0,points:0,for:0,against:0};
    if (!map[away]) map[away] = {played:0,won:0,lost:0,points:0,for:0,against:0};

    map[home].played++;
    map[away].played++;
    map[home].for += hs;
    map[home].against += as;
    map[away].for += as;
    map[away].against += hs;

    const result = String(m[5] || "").toLowerCase();

    if (hs > as || result.includes(home.toLowerCase())) {
      map[home].won++;
      map[home].points += 2;
      map[away].lost++;
    } else if (as > hs || result.includes(away.toLowerCase())) {
      map[away].won++;
      map[away].points += 2;
      map[home].lost++;
    }
  });

  HPL.points = Object.entries(map).map(([team, x]) => [
    team,x.played,x.won,x.lost,x.points,x.for,x.against
  ]);
}

function saveScorecard() {
  const text = $("scorecardJSON").value.trim();
  if (!text) return alert("Enter scorecard JSON.");

  try {
    const data = JSON.parse(text);
    const id = data.matchId || data.id;
    if (!id) return alert("Scorecard JSON needs matchId or id.");
    HPL.scorecards[id] = data;
    $("scorecardJSON").value = "";
    status("Scorecard saved in memory. Press SAVE DATA.");
  } catch {
    alert("Invalid scorecard JSON.");
  }
}

function setupEvents() {
  $("loginBtn").onclick = login;
  $("logoutBtn").onclick = () => signOut(auth);
  $("loadBtn").onclick = loadData;
  $("saveBtn").onclick = saveData;
  $("addTeamBtn").onclick = addTeam;
  $("addPlayerBtn").onclick = addPlayer;
  $("addMatchBtn").onclick = addOrUpdateMatch;
  $("addPointBtn").onclick = () => {
    const team = $("pointTeam").value.trim();
    if (!team) return alert("Enter team.");
    const existing = HPL.points.findIndex(p => Array.isArray(p) && p[0] === team);
    const value = [
      team,
      Number($("pointPlayed").value || 0),
      Number($("pointWon").value || 0),
      Number($("pointLost").value || 0),
      Number($("pointPoints").value || 0),
      0,0
    ];
    if (existing >= 0) HPL.points[existing] = value;
    else HPL.points.push(value);
    renderAll();
  };
  $("saveScorecardBtn").onclick = saveScorecard;
  setupTabs();
}

onAuthStateChanged(auth, user => {
  if (user) {
    show("loginScreen", false);
    show("adminScreen", true);
    loadData();
  } else {
    show("loginScreen", true);
    show("adminScreen", false);
  }
});

setupEvents();
