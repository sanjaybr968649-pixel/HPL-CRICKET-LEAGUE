// HPL SEASON 11 - FIRESTORE SAFE ADMIN PANEL
// Important: Firestore does not allow arrays inside arrays.
// This version stores arrays as arrays of objects, so SAVE DATA works.

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
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(message, error = false) {
  const el = $("status");
  if (!el) return;
  el.textContent = message;
  el.style.color = error ? "#dc2626" : "#16a34a";
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
      const page = $(tab.dataset.page);
      if (page) page.classList.add("active");
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

function teamToObject(team) {
  if (!Array.isArray(team)) return {
    name: team?.name || "",
    logo: team?.logo || "",
    captain: team?.captain || "",
    ground: team?.ground || ""
  };

  return {
    name: team[0] || "",
    logo: team[1] || "",
    captain: team[2] || "",
    ground: team[3] || ""
  };
}

function playerToObject(player) {
  if (!Array.isArray(player)) {
    return {
      name: player?.name || "",
      short: player?.short || "",
      team: player?.team || "",
      place: player?.place || "",
      role: player?.role || "",
      batting: player?.batting || "",
      bowling: player?.bowling || "",
      jersey: player?.jersey || "",
      matches: Number(player?.matches || 0),
      runs: Number(player?.runs || 0),
      fifties: Number(player?.fifties || 0),
      hundreds: Number(player?.hundreds || 0),
      highest: Number(player?.highest || 0),
      notOuts: Number(player?.notOuts || 0),
      wickets: Number(player?.wickets || 0)
    };
  }

  return {
    name: player[0] || "",
    short: player[1] || "",
    team: player[2] || "",
    place: player[3] || "",
    role: player[4] || "",
    batting: player[5] || "",
    bowling: player[6] || "",
    jersey: player[7] || "",
    matches: Number(player[8] || 0),
    runs: Number(player[9] || 0),
    fifties: Number(player[10] || 0),
    hundreds: Number(player[11] || 0),
    highest: Number(player[12] || 0),
    notOuts: Number(player[13] || 0),
    wickets: Number(player[14] || 0)
  };
}

function performanceToObject(performance) {
  const result = {};

  if (Array.isArray(performance)) {
    performance.forEach((item, index) => {
      if (!item || typeof item !== "object") return;
      const name = String(item.name || `player_${index}`);
      result[name] = {
        name,
        runs: Number(item.runs || 0),
        wickets: Number(item.wickets || 0),
        matches: Number(item.matches ?? 1),
        notOut: Boolean(item.notOut)
      };
    });
  } else if (performance && typeof performance === "object") {
    Object.entries(performance).forEach(([key, item]) => {
      result[key] = {
        name: item?.name || key,
        runs: Number(item?.runs || 0),
        wickets: Number(item?.wickets || 0),
        matches: Number(item?.matches ?? 1),
        notOut: Boolean(item?.notOut)
      };
    });
  }

  return result;
}

function performanceToArray(performance) {
  if (!performance || typeof performance !== "object") return [];

  return Object.values(performance).map(item => ({
    name: item.name || "",
    runs: Number(item.runs || 0),
    wickets: Number(item.wickets || 0),
    matches: Number(item.matches ?? 1),
    notOut: Boolean(item.notOut)
  }));
}

function matchToObject(match) {
  if (!Array.isArray(match)) {
    return {
      id: match?.id || "",
      home: match?.home || "",
      away: match?.away || "",
      homeScore: Number(match?.homeScore || 0),
      awayScore: Number(match?.awayScore || 0),
      result: match?.result || "",
      ground: match?.ground || "",
      homeWickets: Number(match?.homeWickets || 0),
      awayWickets: Number(match?.awayWickets || 0),
      performance: performanceToObject(match?.performance)
    };
  }

  return {
    id: match[0] || "",
    home: match[1] || "",
    away: match[2] || "",
    homeScore: Number(match[3] || 0),
    awayScore: Number(match[4] || 0),
    result: match[5] || "",
    ground: match[6] || "",
    homeWickets: Number(match[7] || 0),
    awayWickets: Number(match[8] || 0),
    performance: performanceToObject(match[9])
  };
}

function pointToObject(point) {
  if (!Array.isArray(point)) {
    return {
      team: point?.team || "",
      played: Number(point?.played || 0),
      won: Number(point?.won || 0),
      lost: Number(point?.lost || 0),
      points: Number(point?.points || 0),
      for: Number(point?.for || 0),
      against: Number(point?.against || 0)
    };
  }

  return {
    team: point[0] || "",
    played: Number(point[1] || 0),
    won: Number(point[2] || 0),
    lost: Number(point[3] || 0),
    points: Number(point[4] || 0),
    for: Number(point[5] || 0),
    against: Number(point[6] || 0)
  };
}

function normalizeLoadedData(data) {
  return {
    teams: Array.isArray(data?.teams) ? data.teams.map(teamToObject) : [],
    players: Array.isArray(data?.players) ? data.players.map(playerToObject) : [],
    matches: Array.isArray(data?.matches) ? data.matches.map(matchToObject) : [],
    points: Array.isArray(data?.points) ? data.points.map(pointToObject) : [],
    scorecards: data?.scorecards && typeof data.scorecards === "object"
      ? data.scorecards
      : {}
  };
}

function firestoreSafeData() {
  // Every top-level collection is an array of OBJECTS.
  // No array contains another array.
  const scorecards = {};

  Object.entries(HPL.scorecards || {}).forEach(([id, value]) => {
    // Store scorecard as JSON text so even deeply nested scorecard arrays
    // cannot trigger Firestore's nested-array restriction.
    scorecards[id] = typeof value === "string" ? value : JSON.stringify(value);
  });

  return {
    teams: HPL.teams.map(teamToObject),
    players: HPL.players.map(playerToObject),
    matches: HPL.matches.map(matchToObject),
    points: HPL.points.map(pointToObject),
    scorecards
  };
}

async function loadData() {
  try {
    setStatus("Loading...");

    const snap = await getDoc(dataRef);

    if (!snap.exists()) {
      HPL = { teams: [], players: [], matches: [], points: [], scorecards: {} };
      renderAll();
      setStatus("No data found. You can add new data.");
      return;
    }

    HPL = normalizeLoadedData(snap.data());
    renderAll();
    setStatus("Data loaded.");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Could not load data.", true);
  }
}

async function saveData() {
  try {
    // SAFETY GUARD: never overwrite Firebase with a completely empty panel.
    const localHasData =
      HPL.teams.length > 0 ||
      HPL.players.length > 0 ||
      HPL.matches.length > 0 ||
      HPL.points.length > 0 ||
      Object.keys(HPL.scorecards || {}).length > 0;

    if (!localHasData) {
      setStatus("Nothing to save. Firebase was NOT changed.", true);
      return;
    }

    setStatus("Saving...");

    const safeData = firestoreSafeData();
    // merge:true prevents unrelated Firestore fields from being deleted.
    await setDoc(dataRef, safeData, { merge: true });

    setStatus("Saved successfully to Firebase.");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Could not save data.", true);
  }
}

async function autoSave() {
  // All add/update/delete actions use the same protected save path.
  await saveData();
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
    box.innerHTML += `
      <div class="item">
        <div>
          <b>${esc(team.name)}</b><br>
          Captain: ${esc(team.captain)}<br>
          Ground: ${esc(team.ground)}<br>
          Logo: ${esc(team.logo)}
        </div>
        <button class="delete" data-delete-team="${i}">DELETE</button>
      </div>`;
  });

  box.querySelectorAll("[data-delete-team]").forEach(btn => {
    btn.onclick = async () => {
      HPL.teams.splice(Number(btn.dataset.deleteTeam), 1);
      renderAll();
      await autoSave();
    };
  });
}

function renderPlayers() {
  const box = $("playersList");
  box.innerHTML = "";

  HPL.players.forEach((p, i) => {
    box.innerHTML += `
      <div class="item">
        <div>
          <b>${esc(p.name)}</b> — ${esc(p.role)}<br>
          ${esc(p.team)} | ${esc(p.place)} | Jersey ${esc(p.jersey)}<br>
          Matches: ${p.matches} | Runs: ${p.runs} | Wickets: ${p.wickets}
        </div>
        <button class="delete" data-delete-player="${i}">DELETE</button>
      </div>`;
  });

  box.querySelectorAll("[data-delete-player]").forEach(btn => {
    btn.onclick = async () => {
      HPL.players.splice(Number(btn.dataset.deletePlayer), 1);
      renderAll();
      await autoSave();
    };
  });
}

function renderMatches() {
  const box = $("matchesList");
  box.innerHTML = "";

  HPL.matches.forEach((m, i) => {
    box.innerHTML += `
      <div class="item">
        <div>
          <b>${esc(m.id)}</b>: ${esc(m.home)} vs ${esc(m.away)}<br>
          Score: ${m.homeScore}/${m.homeWickets} — ${m.awayScore}/${m.awayWickets}<br>
          Result: ${esc(m.result)} | Ground: ${esc(m.ground)}
        </div>
        <button class="delete" data-delete-match="${i}">DELETE</button>
      </div>`;
  });

  box.querySelectorAll("[data-delete-match]").forEach(btn => {
    btn.onclick = async () => {
      const index = Number(btn.dataset.deleteMatch);
      const old = HPL.matches[index];

      applyPerformance(old?.performance || {}, -1);
      HPL.matches.splice(index, 1);
      recalculatePoints();
      renderAll();
      await autoSave();
    };
  });
}

function renderPoints() {
  const box = $("pointsList");
  box.innerHTML = "";

  HPL.points.forEach((p, i) => {
    const nrr = Number(p.for || 0) - Number(p.against || 0);

    box.innerHTML += `
      <div class="item">
        <div>
          <b>${esc(p.team)}</b><br>
          P: ${p.played} | W: ${p.won} | L: ${p.lost} | Points: ${p.points}<br>
          NRR: ${nrr}
        </div>
        <button class="delete" data-delete-point="${i}">DELETE</button>
      </div>`;
  });

  box.querySelectorAll("[data-delete-point]").forEach(btn => {
    btn.onclick = async () => {
      HPL.points.splice(Number(btn.dataset.deletePoint), 1);
      renderAll();
      await autoSave();
    };
  });
}

async function addTeam() {
  const name = $("teamName").value.trim();
  if (!name) return alert("Enter team name.");

  HPL.teams.push({
    name,
    logo: $("teamLogo").value.trim(),
    captain: $("teamCaptain").value.trim(),
    ground: $("teamGround").value.trim()
  });

  ["teamName","teamLogo","teamCaptain","teamGround"].forEach(id => $(id).value = "");

  renderAll();
  await autoSave();
}

async function addPlayer() {
  const name = $("playerName").value.trim();
  if (!name) return alert("Enter player name.");

  HPL.players.push({
    name,
    short: $("playerShort").value.trim(),
    team: $("playerTeam").value.trim(),
    place: $("playerPlace").value.trim(),
    role: $("playerRole").value.trim(),
    batting: $("playerBatting").value.trim(),
    bowling: $("playerBowling").value.trim(),
    jersey: $("playerJersey").value.trim(),
    matches: 0,
    runs: 0,
    fifties: 0,
    hundreds: 0,
    highest: 0,
    notOuts: 0,
    wickets: 0
  });

  ["playerName","playerShort","playerTeam","playerPlace","playerRole",
   "playerBatting","playerBowling","playerJersey"].forEach(id => $(id).value = "");

  renderAll();
  await autoSave();
}

function parsePerformance(text) {
  if (!text.trim()) return {};

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error();
    return performanceToObject(parsed);
  } catch {
    alert("Invalid performance JSON. Use an array like [{\"name\":\"Sanjay B R\",\"runs\":137,\"wickets\":0,\"notOut\":false}]");
    return null;
  }
}

function findPlayer(name) {
  return HPL.players.find(
    p => String(p.name).toLowerCase() === String(name).toLowerCase()
  );
}

function applyPerformance(performance, direction = 1) {
  if (!performance || typeof performance !== "object") return;

  Object.values(performance).forEach(stat => {
    const player = findPlayer(stat.name);
    if (!player) return;

    const runs = Number(stat.runs || 0);
    const wickets = Number(stat.wickets || 0);
    const matches = Number(stat.matches ?? 1);

    player.matches = Math.max(0, player.matches + matches * direction);
    player.runs = Math.max(0, player.runs + runs * direction);
    player.wickets = Math.max(0, player.wickets + wickets * direction);

    if (direction > 0) {
      if (runs >= 100) player.hundreds++;
      else if (runs >= 50) player.fifties++;

      if (runs > player.highest) player.highest = runs;
      if (stat.notOut) player.notOuts++;
    } else {
      if (runs >= 100) player.hundreds = Math.max(0, player.hundreds - 1);
      else if (runs >= 50) player.fifties = Math.max(0, player.fifties - 1);

      if (stat.notOut) player.notOuts = Math.max(0, player.notOuts - 1);
    }
  });
}

async function addOrUpdateMatch() {
  const id = $("matchId").value.trim();
  if (!id) return alert("Enter Match ID.");

  const performance = parsePerformance($("matchPerformance").value);
  if (performance === null) return;

  const newMatch = {
    id,
    home: $("matchHome").value.trim(),
    away: $("matchAway").value.trim(),
    homeScore: Number($("matchHomeScore").value || 0),
    awayScore: Number($("matchAwayScore").value || 0),
    result: $("matchResult").value.trim(),
    ground: $("matchGround").value.trim(),
    homeWickets: Number($("matchHomeWickets").value || 0),
    awayWickets: Number($("matchAwayWickets").value || 0),
    performance
  };

  const index = HPL.matches.findIndex(m => m.id === id);

  if (index >= 0) {
    applyPerformance(HPL.matches[index].performance || {}, -1);
    HPL.matches[index] = newMatch;
  } else {
    HPL.matches.push(newMatch);
  }

  applyPerformance(performance, 1);
  recalculatePoints();
  renderAll();
  await autoSave();

  ["matchId","matchHome","matchAway","matchHomeScore","matchAwayScore",
   "matchHomeWickets","matchAwayWickets","matchResult","matchGround",
   "matchPerformance"].forEach(id => $(id).value = "");
}

function recalculatePoints() {
  const map = {};

  HPL.teams.forEach(team => {
    map[team.name] = {
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      for: 0,
      against: 0
    };
  });

  HPL.matches.forEach(match => {
    const home = match.home;
    const away = match.away;
    const hs = Number(match.homeScore || 0);
    const as = Number(match.awayScore || 0);

    if (!map[home]) {
      map[home] = {played:0,won:0,lost:0,points:0,for:0,against:0};
    }
    if (!map[away]) {
      map[away] = {played:0,won:0,lost:0,points:0,for:0,against:0};
    }

    map[home].played++;
    map[away].played++;

    map[home].for += hs;
    map[home].against += as;
    map[away].for += as;
    map[away].against += hs;

    if (hs > as) {
      map[home].won++;
      map[home].points += 2;
      map[away].lost++;
    } else if (as > hs) {
      map[away].won++;
      map[away].points += 2;
      map[home].lost++;
    }
  });

  HPL.points = Object.entries(map).map(([team, x]) => ({
    team,
    played: x.played,
    won: x.won,
    lost: x.lost,
    points: x.points,
    for: x.for,
    against: x.against
  }));
}

async function addOrUpdatePoint() {
  const team = $("pointTeam").value.trim();
  if (!team) return alert("Enter team.");

  const value = {
    team,
    played: Number($("pointPlayed").value || 0),
    won: Number($("pointWon").value || 0),
    lost: Number($("pointLost").value || 0),
    points: Number($("pointPoints").value || 0),
    for: 0,
    against: 0
  };

  const index = HPL.points.findIndex(p => p.team === team);
  if (index >= 0) HPL.points[index] = value;
  else HPL.points.push(value);

  renderAll();
  await autoSave();

  ["pointTeam","pointPlayed","pointWon","pointLost","pointPoints"]
    .forEach(id => $(id).value = "");
}

async function saveScorecard() {
  const text = $("scorecardJSON").value.trim();
  if (!text) return alert("Enter scorecard JSON.");

  try {
    const data = JSON.parse(text);
    const id = data.matchId || data.id;

    if (!id) return alert("Scorecard JSON needs matchId or id.");

    HPL.scorecards[id] = text;
    $("scorecardJSON").value = "";
    await autoSave();
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
  $("addPointBtn").onclick = addOrUpdatePoint;
  $("saveScorecardBtn").onclick = saveScorecard;

  setupTabs();
}

onAuthStateChanged(auth, user => {
  if (user) {
    $("loginScreen").classList.add("hidden");
    $("adminScreen").classList.remove("hidden");
    loadData();
  } else {
    $("loginScreen").classList.remove("hidden");
    $("adminScreen").classList.add("hidden");
  }
});

setupEvents();
