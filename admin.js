// HPL ADMIN PANEL - FIREBASE VERSION
// Fixes: Nested arrays are not supported
// Firebase: Firestore hpl/data

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// ===============================
// FIREBASE CONFIG
// ===============================

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


// ===============================
// LOCAL DATA
// ===============================

let HPL = {
  teams: [],
  players: [],
  matches: [],
  points: [],
  scorecards: {}
};


// ===============================
// DOM HELPER
// ===============================

const $ = id => document.getElementById(id);

function msg(text, ok = true) {
  const el =
    $("loginMsg") ||
    $("statusMsg") ||
    $("message");

  if (el) {
    el.textContent = text;
    el.style.color = ok ? "#22c55e" : "#ef4444";
  }

  console.log(text);
}


// ===============================
// FIRESTORE SAFE ENCODER
// ===============================
//
// Firestore does NOT allow an array inside an array.
// Example:
// [["Player", 10, 2]]
//
// We convert nested arrays to:
// { __hplArray: [...] }
//
// Then decode them when loading.
//

function encodeFirestore(value) {

  if (value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {

    return {
      __hplArray: value.map(item => encodeFirestore(item))
    };
  }

  if (value !== null && typeof value === "object") {

    const result = {};

    Object.keys(value).forEach(key => {
      result[key] = encodeFirestore(value[key]);
    });

    return result;
  }

  return value;
}


function decodeFirestore(value) {

  if (value === null || value === undefined) {
    return value;
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    value.__hplArray !== undefined
  ) {

    return value.__hplArray.map(item =>
      decodeFirestore(item)
    );
  }

  if (Array.isArray(value)) {
    return value.map(item =>
      decodeFirestore(item)
    );
  }

  if (typeof value === "object") {

    const result = {};

    Object.keys(value).forEach(key => {
      result[key] = decodeFirestore(value[key]);
    });

    return result;
  }

  return value;
}


// ===============================
// NORMALIZE DATA
// ===============================

function normalizeData(data) {

  const source = data || {};

  return {
    teams: Array.isArray(source.teams)
      ? source.teams
      : [],

    players: Array.isArray(source.players)
      ? source.players
      : [],

    matches: Array.isArray(source.matches)
      ? source.matches
      : [],

    points: Array.isArray(source.points)
      ? source.points
      : [],

    scorecards:
      source.scorecards &&
      typeof source.scorecards === "object" &&
      !Array.isArray(source.scorecards)
        ? source.scorecards
        : {}
  };
}


// ===============================
// LOAD DATA
// ===============================

async function loadData() {

  try {

    msg("Loading HPL data...", true);

    const snap = await getDoc(DATA_REF);

    if (!snap.exists()) {

      HPL = {
        teams: [],
        players: [],
        matches: [],
        points: [],
        scorecards: {}
      };

      renderAll();

      msg("No Firebase data found.", false);
      return;
    }

    const raw = snap.data();

    HPL = normalizeData(
      decodeFirestore(raw)
    );

    // Ensure Chasers spelling
    fixChasersName();

    renderAll();

    msg(
      `Loaded: ${HPL.teams.length} teams, ${HPL.players.length} players, ${HPL.matches.length} matches`,
      true
    );

  } catch (error) {

    console.error(error);

    msg(
      "LOAD ERROR: " + error.message,
      false
    );
  }
}


// ===============================
// FIX CHESARA -> CHASERS
// ===============================

function fixChasersName() {

  HPL.teams.forEach(team => {

    if (
      team &&
      typeof team === "object" &&
      team.name === "Chesara"
    ) {
      team.name = "Chasers";
    }
  });


  HPL.players.forEach(player => {

    if (
      player &&
      typeof player === "object" &&
      player.team === "Chesara"
    ) {
      player.team = "Chasers";
    }
  });


  HPL.matches.forEach(match => {

    if (!match || typeof match !== "object") {
      return;
    }

    if (match.home === "Chesara") {
      match.home = "Chasers";
    }

    if (match.away === "Chesara") {
      match.away = "Chasers";
    }
  });


  HPL.points.forEach(point => {

    if (
      point &&
      typeof point === "object" &&
      point.team === "Chesara"
    ) {
      point.team = "Chasers";
    }
  });
}


// ===============================
// SAVE DATA
// ===============================

async function saveData() {

  try {

    if (!auth.currentUser) {

      msg(
        "Please login first.",
        false
      );

      return;
    }


    fixChasersName();


    const safeData = encodeFirestore({
      teams: HPL.teams,
      players: HPL.players,
      matches: HPL.matches,
      points: HPL.points,
      scorecards: HPL.scorecards
    });


    msg("Saving to Firebase...", true);


    await setDoc(
      DATA_REF,
      safeData,
      {
        merge: false
      }
    );


    msg(
      "✅ SAVED! Live website will update from Firebase.",
      true
    );

  } catch (error) {

    console.error(error);

    msg(
      "SAVE ERROR: " + error.message,
      false
    );
  }
}


// ===============================
// TEAMS
// ===============================

function addTeam() {

  const name = $("teamName")?.value.trim();

  if (!name) {
    alert("Enter team name.");
    return;
  }


  const team = {
    name: name,
    logo: $("teamLogo")?.value.trim() || "",
    captain: $("teamCaptain")?.value.trim() || "",
    ground:
      $("teamGround")?.value.trim() ||
      ""
  };


  const existingIndex = HPL.teams.findIndex(
    t =>
      t &&
      typeof t === "object" &&
      t.name === name
  );


  if (existingIndex >= 0) {

    HPL.teams[existingIndex] = {
      ...HPL.teams[existingIndex],
      ...team
    };

  } else {

    HPL.teams.push(team);
  }


  renderTeams();

  clearTeamForm();

  msg(
    "Team added/updated. Press SAVE DATA.",
    true
  );
}


function editTeam(index) {

  const team = HPL.teams[index];

  if (!team) {
    return;
  }


  $("teamName").value = team.name || "";
  $("teamLogo").value = team.logo || "";
  $("teamCaptain").value = team.captain || "";
  $("teamGround").value = team.ground || "";


  $("teamName")?.focus();
}


function deleteTeam(index) {

  if (!confirm("Delete this team?")) {
    return;
  }


  HPL.teams.splice(index, 1);

  renderTeams();

  msg(
    "Team deleted. Press SAVE DATA.",
    true
  );
}


function clearTeamForm() {

  if ($("teamName")) $("teamName").value = "";
  if ($("teamLogo")) $("teamLogo").value = "";
  if ($("teamCaptain")) $("teamCaptain").value = "";
  if ($("teamGround")) $("teamGround").value = "";
}


// ===============================
// PLAYERS
// ===============================

function addPlayer() {

  const name = $("playerName")?.value.trim();

  if (!name) {
    alert("Enter player name.");
    return;
  }


  const player = {

    name: name,

    short:
      $("playerShort")?.value.trim() || "",

    team:
      $("playerTeam")?.value.trim() || "",

    place:
      $("playerPlace")?.value.trim() || "",

    role:
      $("playerRole")?.value.trim() || "",

    batting:
      $("playerBatting")?.value.trim() || "",

    bowling:
      $("playerBowling")?.value.trim() || "",

    jersey:
      $("playerJersey")?.value.trim() || "",

    matches:
      Number($("playerMatches")?.value || 0),

    runs:
      Number($("playerRuns")?.value || 0),

    wickets:
      Number($("playerWickets")?.value || 0),

    highest:
      Number($("playerHighest")?.value || 0),

    fifties:
      Number($("playerFifties")?.value || 0),

    hundreds:
      Number($("playerHundreds")?.value || 0)
  };


  const index = HPL.players.findIndex(
    p =>
      p &&
      typeof p === "object" &&
      p.name === name
  );


  if (index >= 0) {

    HPL.players[index] = {
      ...HPL.players[index],
      ...player
    };

  } else {

    HPL.players.push(player);
  }


  renderPlayers();

  msg(
    "Player added/updated. Press SAVE DATA.",
    true
  );
}


function editPlayer(index) {

  const p = HPL.players[index];

  if (!p) return;


  if ($("playerName")) $("playerName").value = p.name || "";
  if ($("playerShort")) $("playerShort").value = p.short || "";
  if ($("playerTeam")) $("playerTeam").value = p.team || "";
  if ($("playerPlace")) $("playerPlace").value = p.place || "";
  if ($("playerRole")) $("playerRole").value = p.role || "";
  if ($("playerBatting")) $("playerBatting").value = p.batting || "";
  if ($("playerBowling")) $("playerBowling").value = p.bowling || "";
  if ($("playerJersey")) $("playerJersey").value = p.jersey || "";

  if ($("playerMatches")) $("playerMatches").value = p.matches ?? 0;
  if ($("playerRuns")) $("playerRuns").value = p.runs ?? 0;
  if ($("playerWickets")) $("playerWickets").value = p.wickets ?? 0;
  if ($("playerHighest")) $("playerHighest").value = p.highest ?? 0;
  if ($("playerFifties")) $("playerFifties").value = p.fifties ?? 0;
  if ($("playerHundreds")) $("playerHundreds").value = p.hundreds ?? 0;

}


function deletePlayer(index) {

  if (!confirm("Delete this player?")) {
    return;
  }


  HPL.players.splice(index, 1);

  renderPlayers();

  msg(
    "Player deleted. Press SAVE DATA.",
    true
  );
}


// ===============================
// MATCHES
// ===============================

function addMatch() {

  const id = $("matchId")?.value.trim();

  if (!id) {
    alert("Enter match ID.");
    return;
  }


  const match = {

    matchId: id,

    home:
      $("matchHome")?.value.trim() || "",

    away:
      $("matchAway")?.value.trim() || "",

    homeScore:
      $("matchHomeScore")?.value.trim() || "",

    awayScore:
      $("matchAwayScore")?.value.trim() || "",

    homeWickets:
      Number($("matchHomeWickets")?.value || 0),

    awayWickets:
      Number($("matchAwayWickets")?.value || 0),

    result:
      $("matchResult")?.value.trim() || "",

    ground:
      $("matchGround")?.value.trim() || "",

    performance:
      $("matchPerformance")?.value.trim() || ""
  };


  const index = HPL.matches.findIndex(
    m =>
      m &&
      typeof m === "object" &&
      String(m.matchId) === String(id)
  );


  if (index >= 0) {

    HPL.matches[index] = {
      ...HPL.matches[index],
      ...match
    };

  } else {

    HPL.matches.push(match);
  }


  renderMatches();

  msg(
    "Match added/updated. Press SAVE DATA.",
    true
  );
}


function editMatch(index) {

  const m = HPL.matches[index];

  if (!m) return;


  if ($("matchId")) $("matchId").value = m.matchId || "";
  if ($("matchHome")) $("matchHome").value = m.home || "";
  if ($("matchAway")) $("matchAway").value = m.away || "";
  if ($("matchHomeScore")) $("matchHomeScore").value = m.homeScore || "";
  if ($("matchAwayScore")) $("matchAwayScore").value = m.awayScore || "";
  if ($("matchHomeWickets")) $("matchHomeWickets").value = m.homeWickets ?? 0;
  if ($("matchAwayWickets")) $("matchAwayWickets").value = m.awayWickets ?? 0;
  if ($("matchResult")) $("matchResult").value = m.result || "";
  if ($("matchGround")) $("matchGround").value = m.ground || "";

  if ($("matchPerformance")) {

    $("matchPerformance").value =
      typeof m.performance === "string"
        ? m.performance
        : JSON.stringify(
            m.performance || {},
            null,
            2
          );
  }
}


function deleteMatch(index) {

  if (!confirm("Delete this match?")) {
    return;
  }


  HPL.matches.splice(index, 1);

  renderMatches();

  msg(
    "Match deleted. Press SAVE DATA.",
    true
  );
}


// ===============================
// POINTS
// ===============================

function addPoint() {

  const team = $("pointTeam")?.value.trim();

  if (!team) {
    alert("Enter team.");
    return;
  }


  const point = {

    team: team,

    played:
      Number($("pointPlayed")?.value || 0),

    won:
      Number($("pointWon")?.value || 0),

    lost:
      Number($("pointLost")?.value || 0),

    points:
      Number($("pointPoints")?.value || 0)
  };


  const index = HPL.points.findIndex(
    p =>
      p &&
      typeof p === "object" &&
      p.team === team
  );


  if (index >= 0) {

    HPL.points[index] = {
      ...HPL.points[index],
      ...point
    };

  } else {

    HPL.points.push(point);
  }


  renderPoints();

  msg(
    "Points updated. Press SAVE DATA.",
    true
  );
}


function editPoint(index) {

  const p = HPL.points[index];

  if (!p) return;


  if ($("pointTeam")) $("pointTeam").value = p.team || "";
  if ($("pointPlayed")) $("pointPlayed").value = p.played ?? 0;
  if ($("pointWon")) $("pointWon").value = p.won ?? 0;
  if ($("pointLost")) $("pointLost").value = p.lost ?? 0;
  if ($("pointPoints")) $("pointPoints").value = p.points ?? 0;
}


function deletePoint(index) {

  if (!confirm("Delete this points entry?")) {
    return;
  }


  HPL.points.splice(index, 1);

  renderPoints();

  msg(
    "Points entry deleted. Press SAVE DATA.",
    true
  );
}


// ===============================
// SCORECARD
// ===============================

function saveScorecard() {

  const page = $("scorecardsPage");

  let id = "";

  if (page) {
    id = page.value.trim();
  }


  const textarea = $("scorecardJSON");

  if (!textarea) {
    return;
  }


  let parsed;

  try {

    parsed = JSON.parse(
      textarea.value
    );

  } catch (error) {

    alert(
      "Invalid scorecard JSON:\n" +
      error.message
    );

    return;
  }


  if (!id) {

    if (parsed.id !== undefined) {
      id = String(parsed.id);
    } else {
      alert("Enter scorecard/match ID.");
      return;
    }
  }


  HPL.scorecards[id] = parsed;


  msg(
    "Scorecard updated. Press SAVE DATA.",
    true
  );
}


// ===============================
// RENDER TEAMS
// ===============================

function renderTeams() {

  const list = $("teamsList");

  if (!list) return;


  list.innerHTML = "";


  HPL.teams.forEach((team, index) => {

    if (!team) return;


    const name =
      typeof team === "string"
        ? team
        : team.name || "";


    const captain =
      typeof team === "object"
        ? team.captain || ""
        : "";


    const ground =
      typeof team === "object"
        ? team.ground || ""
        : "";


    const div = document.createElement("div");

    div.className = "admin-item";


    div.innerHTML = `
      <div>
        <strong>${escapeHTML(name)}</strong>
        <small>
          Captain: ${escapeHTML(captain)}
          ${ground ? " | Ground: " + escapeHTML(ground) : ""}
        </small>
      </div>

      <div>
        <button type="button" data-edit="${index}">
          CHANGE
        </button>

        <button type="button" data-delete="${index}">
          DELETE
        </button>
      </div>
    `;


    div.querySelector(
      `[data-edit="${index}"]`
    )?.addEventListener(
      "click",
      () => editTeam(index)
    );


    div.querySelector(
      `[data-delete="${index}"]`
    )?.addEventListener(
      "click",
      () => deleteTeam(index)
    );


    list.appendChild(div);
  });
}


// ===============================
// RENDER PLAYERS
// ===============================

function renderPlayers() {

  const list = $("playersList");

  if (!list) return;


  list.innerHTML = "";


  HPL.players.forEach((p, index) => {

    if (!p) return;


    const name =
      typeof p === "string"
        ? p
        : p.name || "";


    const team =
      typeof p === "object"
        ? p.team || ""
        : "";


    const div = document.createElement("div");

    div.className = "admin-item";


    div.innerHTML = `
      <div>
        <strong>${escapeHTML(name)}</strong>
        <small>${escapeHTML(team)}</small>
      </div>

      <div>
        <button type="button" data-edit="${index}">
          CHANGE
        </button>

        <button type="button" data-delete="${index}">
          DELETE
        </button>
      </div>
    `;


    div.querySelector(
      `[data-edit="${index}"]`
    )?.addEventListener(
      "click",
      () => editPlayer(index)
    );


    div.querySelector(
      `[data-delete="${index}"]`
    )?.addEventListener(
      "click",
      () => deletePlayer(index)
    );


    list.appendChild(div);
  });
}


// ===============================
// RENDER MATCHES
// ===============================

function renderMatches() {

  const list = $("matchesList");

  if (!list) return;


  list.innerHTML = "";


  HPL.matches.forEach((m, index) => {

    if (!m) return;


    const id =
      m.matchId ??
      m.id ??
      index + 1;


    const home = m.home || "";
    const away = m.away || "";


    const div = document.createElement("div");

    div.className = "admin-item";


    div.innerHTML = `
      <div>
        <strong>Match ${escapeHTML(String(id))}</strong>
        <small>
          ${escapeHTML(home)}
          vs
          ${escapeHTML(away)}
        </small>
      </div>

      <div>
        <button type="button" data-edit="${index}">
          CHANGE
        </button>

        <button type="button" data-delete="${index}">
          DELETE
        </button>
      </div>
    `;


    div.querySelector(
      `[data-edit="${index}"]`
    )?.addEventListener(
      "click",
      () => editMatch(index)
    );


    div.querySelector(
      `[data-delete="${index}"]`
    )?.addEventListener(
      "click",
      () => deleteMatch(index)
    );


    list.appendChild(div);
  });
}


// ===============================
// RENDER POINTS
// ===============================

function renderPoints() {

  const list = $("pointsList");

  if (!list) return;


  list.innerHTML = "";


  HPL.points.forEach((p, index) => {

    if (!p) return;


    const team = p.team || "";


    const div = document.createElement("div");

    div.className = "admin-item";


    div.innerHTML = `
      <div>
        <strong>${escapeHTML(team)}</strong>
        <small>
          Played: ${p.played ?? 0}
          | Won: ${p.won ?? 0}
          | Lost: ${p.lost ?? 0}
          | Points: ${p.points ?? 0}
        </small>
      </div>

      <div>
        <button type="button" data-edit="${index}">
          CHANGE
        </button>

        <button type="button" data-delete="${index}">
          DELETE
        </button>
      </div>
    `;


    div.querySelector(
      `[data-edit="${index}"]`
    )?.addEventListener(
      "click",
      () => editPoint(index)
    );


    div.querySelector(
      `[data-delete="${index}"]`
    )?.addEventListener(
      "click",
      () => deletePoint(index)
    );


    list.appendChild(div);
  });
}


// ===============================
// RENDER ALL
// ===============================

function renderAll() {

  renderTeams();
  renderPlayers();
  renderMatches();
  renderPoints();

  updateCounts();
}


// ===============================
// COUNTS
// ===============================

function updateCounts() {

  if ($("teamCount")) {
    $("teamCount").textContent =
      HPL.teams
