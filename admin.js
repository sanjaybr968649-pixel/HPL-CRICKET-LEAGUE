// ============================================================
// HPL SEASON 11 - FIREBASE ADMIN PANEL
// FINAL MERGE / MIGRATION VERSION
// ============================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

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


// ============================================================
// FIREBASE START
// ============================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const DATA_REF = doc(db, "hpl", "data");


// ============================================================
// LOCAL HPL DATA
// ============================================================

let HPL = {
  teams: [],
  players: [],
  matches: [],
  points: [],
  scorecards: {}
};

let firebaseLoaded = false;
let migrationRunning = false;


// ============================================================
// HELPERS
// ============================================================

function $(id) {
  return document.getElementById(id);
}

function clean(value) {
  return String(value ?? "").trim();
}

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function teamName(value) {
  const name = clean(value);

  if (name.toLowerCase() === "chesara") {
    return "Chasers";
  }

  return name;
}

function safeJson(value, fallback = {}) {
  try {
    if (typeof value === "string") {
      return JSON.parse(value);
    }

    return value ?? fallback;
  } catch {
    return fallback;
  }
}


// ============================================================
// LEGACY PLAYER -> OBJECT
// ============================================================

function playerToObject(player) {

  if (!Array.isArray(player)) {
    return {
      name: clean(player?.name),
      short: clean(player?.short),
      team: teamName(player?.team),
      place: clean(player?.place),
      role: clean(player?.role),
      batting: clean(player?.batting),
      bowling: clean(player?.bowling),
      jersey: clean(player?.jersey),
      matches: number(player?.matches),
      runs: number(player?.runs),
      wickets: number(player?.wickets),
      highest: number(player?.highest),
      fifties: number(player?.fifties),
      hundreds: number(player?.hundreds)
    };
  }

  return {
    name: clean(player[0]),
    short: clean(player[1]),
    team: teamName(player[2]),
    place: clean(player[3]),
    role: clean(player[4]),
    batting: clean(player[5]),
    bowling: clean(player[6]),
    jersey: clean(player[7]),

    matches: number(player[9]),
    runs: number(player[10]),
    wickets: number(player[11]),
    highest: number(player[12]),
    fifties: number(player[13]),
    hundreds: number(player[14])
  };
}


// ============================================================
// PLAYER OBJECT -> LEGACY ARRAY
// ============================================================

function playerToLegacy(p) {

  return [
    p.name || "",
    p.short || "",
    teamName(p.team),
    p.place || "",
    p.role || "",
    p.batting || "",
    p.bowling || "",
    p.jersey || "",
    0,

    number(p.matches),
    number(p.runs),
    number(p.wickets),
    number(p.highest),
    number(p.fifties),
    number(p.hundreds)
  ];
}


// ============================================================
// SCORE PARSER
// ============================================================

function parseScore(score) {

  const text = clean(score);

  if (!text) {
    return {
      runs: 0,
      wickets: 0
    };
  }

  const match = text.match(/^(\d+)\s*\/\s*(\d+)$/);

  if (match) {
    return {
      runs: number(match[1]),
      wickets: number(match[2])
    };
  }

  return {
    runs: number(text),
    wickets: 0
  };
}


// ============================================================
// MATCH -> OBJECT
// ============================================================

function matchToObject(match) {

  if (!Array.isArray(match)) {

    const homeScore = parseScore(
      match?.homeScoreText ??
      match?.homeScore ??
      ""
    );

    const awayScore = parseScore(
      match?.awayScoreText ??
      match?.awayScore ??
      ""
    );

    return {
      matchId: clean(match?.matchId),
      home: teamName(match?.home),
      away: teamName(match?.away),

      homeScore: number(
        typeof match?.homeScore === "number"
          ? match.homeScore
          : homeScore.runs
      ),

      awayScore: number(
        typeof match?.awayScore === "number"
          ? match.awayScore
          : awayScore.runs
      ),

      homeWickets: number(
        match?.homeWickets ?? homeScore.wickets
      ),

      awayWickets: number(
        match?.awayWickets ?? awayScore.wickets
      ),

      result: clean(match?.result),
      ground: clean(match?.ground),

      performance: match?.performance || {}
    };
  }

  return {
    matchId: clean(match[0]),
    home: teamName(match[1]),
    away: teamName(match[2]),

    homeScore: parseScore(match[3]).runs,
    homeWickets: parseScore(match[3]).wickets,

    awayScore: parseScore(match[4]).runs,
    awayWickets: parseScore(match[4]).wickets,

    result: clean(match[5]),
    ground: clean(match[6]),

    performance: {}
  };
}


// ============================================================
// POINT -> OBJECT
// ============================================================

function pointToObject(point) {

  if (!Array.isArray(point)) {

    return {
      team: teamName(point?.team),
      played: number(point?.played),
      won: number(point?.won),
      lost: number(point?.lost),
      points: number(point?.points),
      forRuns: number(point?.forRuns),
      againstRuns: number(point?.againstRuns)
    };
  }

  return {
    team: teamName(point[0]),
    played: number(point[1]),
    won: number(point[2]),
    lost: number(point[3]),
    points: number(point[4]),
    forRuns: number(point[5]),
    againstRuns: number(point[6])
  };
}


// ============================================================
// TEAM -> OBJECT
// ============================================================

function teamToObject(team) {

  return {
    name: teamName(team?.name),
    logo: clean(team?.logo),
    captain: clean(team?.captain),
    ground: clean(team?.ground)
  };
}


// ============================================================
// NORMALIZE DATA
// ============================================================

function normalizeData(data = {}) {

  return {

    teams: Array.isArray(data.teams)
      ? data.teams.map(teamToObject)
      : [],

    players: Array.isArray(data.players)
      ? data.players.map(playerToObject)
      : [],

    matches: Array.isArray(data.matches)
      ? data.matches.map(matchToObject)
      : [],

    points: Array.isArray(data.points)
      ? data.points.map(pointToObject)
      : [],

    scorecards:
      typeof data.scorecards === "object" &&
      data.scorecards !== null
        ? data.scorecards
        : {}
  };
}


// ============================================================
// FIRESTORE SAFE DATA
// ============================================================

function firestoreSafeData(data = HPL) {

  return {
    teams: data.teams.map(teamToObject),

    players: data.players.map(playerToObject),

    matches: data.matches.map(match => ({
      ...matchToObject(match),
      performance:
        typeof match.performance === "string"
          ? match.performance
          : match.performance || {}
    })),

    points: data.points.map(pointToObject),

    scorecards: Object.fromEntries(
      Object.entries(data.scorecards || {}).map(
        ([key, value]) => [
          String(key),
          typeof value === "string"
            ? value
            : JSON.stringify(value)
        ]
      )
    )
  };
}


// ============================================================
// EXTRACT HPL OBJECT FROM PUBLIC APP.JS
// ============================================================

function extractObjectLiteral(source, variableName) {

  const startPattern = new RegExp(
    "(?:const|let|var)\\s+" +
    variableName +
    "\\s*=\\s*\\{"
  );

  const match = source.match(startPattern);

  if (!match) {
    throw new Error(
      variableName + " object not found in app.js"
    );
  }

  const start = match.index + match[0].lastIndexOf("{");

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
    ) {
      quote = ch;
      continue;
    }

    if (ch === "{") {
      depth++;
    }

    if (ch === "}") {

      depth--;

      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  throw new Error(
    "Could not read complete HPL object from app.js"
  );
}


// ============================================================
// LOAD EXISTING PUBLIC APP.JS DATA
// ============================================================

async function importExistingPublicData() {

  const url = new URL(
    "app.js",
    window.location.href
  );

  const response = await fetch(
    url.toString(),
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(
      "Could not open public app.js"
    );
  }

  const source = await response.text();

  const objectText =
    extractObjectLiteral(source, "HPL");

  const publicData =
    new Function(
      "return (" + objectText + ");"
    )();

  return normalizeData(publicData);
}


// ============================================================
// MERGE DATA
// ============================================================

function mergeByKey(existing, incoming, keyFunction) {

  const result = [...existing];

  const index = new Map();

  result.forEach((item, indexNumber) => {
    index.set(
      keyFunction(item),
      indexNumber
    );
  });

  for (const item of incoming) {

    const key = keyFunction(item);

    if (!key) {
      continue;
    }

    if (index.has(key)) {

      const existingIndex = index.get(key);

      result[existingIndex] = {
        ...result[existingIndex],
        ...item
      };

    } else {

      index.set(key, result.length);
      result.push(item);
    }
  }

  return result;
}


// ============================================================
// MERGE PUBLIC DATA INTO FIREBASE DATA
// ============================================================

function mergeHPLData(existing, publicData) {

  const merged = {
    teams: [],
    players: [],
    matches: [],
    points: [],
    scorecards: {}
  };


  // ----------------------------------------------------------
  // TEAMS
  // Existing Firebase teams are preserved.
  // Missing public teams are added.
  // ----------------------------------------------------------

  merged.teams = mergeByKey(
    existing.teams || [],
    publicData.teams || [],
    item => teamName(item.name).
