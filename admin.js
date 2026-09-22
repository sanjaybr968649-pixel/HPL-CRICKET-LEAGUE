// HPL SEASON 11 - FIRESTORE SAFE ADMIN PANEL
// Firebase + Existing Public HPL Data Migration
// Version: Safe Live Website Setup

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


/* =========================================================
   FIREBASE
   ========================================================= */

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


/* =========================================================
   LOCAL HPL DATA
   ========================================================= */

let HPL = {
  teams: [],
  players: [],
  matches: [],
  points: [],
  scorecards: {}
};


const $ = id => document.getElementById(id);


/* =========================================================
   HELPERS
   ========================================================= */

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
  const el = $("loginMsg");

  if (el) {
    el.textContent = message;
  }
}


/* =========================================================
   TEAM NORMALIZATION
   ========================================================= */

function teamToObject(team) {

  if (!Array.isArray(team)) {

    return {
      name: team?.name || "",
      logo: team?.logo || "",
      captain: team?.captain || "",
      ground: team?.ground || ""
    };

  }

  let name = team[0] || "";

  if (name === "Chesara") {
    name = "Chasers";
  }

  return {
    name,
    logo: team[1] || "",
    captain: team[2] || "",
    ground: team[3] || ""
  };
}


/* =========================================================
   PLAYER NORMALIZATION
   ========================================================= */

function playerToObject(player) {

  if (!Array.isArray(player)) {

    let team = player?.team || "";

    if (team === "Chesara") {
      team = "Chasers";
    }

    return {
      name: player?.name || "",
      short: player?.short || "",
      team,
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


  let team = player[2] || "";

  if (team === "Chesara") {
    team = "Chasers";
  }


  return {

    name: player[0] || "",
    short: player[1] || "",
    team,

    place: player[3] || "",
    role: player[4] || "",
    batting: player[5] || "",
    bowling: player[6] || "",
    jersey: player[7] || "",

    /*
      Public app.js format:

      index 9  = matches
      index 10 = runs
      index 11 = wickets
      index 12 = highest
      index 13 = fifties
      index 14 = hundreds
    */

    matches: Number(player[9] || 0),
    runs: Number(player[10] || 0),
    wickets: Number(player[11] || 0),
    highest: Number(player[12] || 0),
    fifties: Number(player[13] || 0),
    hundreds: Number(player[14] || 0),

    notOuts: 0
  };
}


/* =========================================================
   PERFORMANCE
   ========================================================= */

function performanceToObject(performance) {

  const result = {};

  if (Array.isArray(performance)) {

    performance.forEach((item, index) => {

      if (!item || typeof item !== "object") {
        return;
      }

      const name = String(
        item.name || `player_${index}`
      );

      result[name] = {

        name,

        runs: Number(item.runs || 0),

        wickets: Number(item.wickets || 0),

        matches: Number(
          item.matches ?? 1
        ),

        notOut: Boolean(item.notOut)

      };

    });

  }


  else if (
    performance &&
    typeof performance === "object"
  ) {

    Object.entries(performance).forEach(
      ([key, item]) => {

        result[key] = {

          name: item?.name || key,

          runs: Number(
            item?.runs || 0
          ),

          wickets: Number(
            item?.wickets || 0
          ),

          matches: Number(
            item?.matches ?? 1
          ),

          notOut: Boolean(
            item?.notOut
          )

        };

      }
    );

  }

  return result;
}


function performanceToArray(performance) {

  if (
    !performance ||
    typeof performance !== "object"
  ) {
    return [];
  }

  return Object.values(performance).map(
    item => ({

      name: item.name || "",

      runs: Number(
        item.runs || 0
      ),

      wickets: Number(
        item.wickets || 0
      ),

      matches: Number(
        item.matches ?? 1
      ),

      notOut: Boolean(
        item.notOut
      )

    })
  );
}


/* =========================================================
   MATCH NORMALIZATION
   ========================================================= */

function scoreValue(value) {

  if (typeof value === "number") {
    return value;
  }

  const text = String(value || "");

  const match = text.match(/^(\d+)/);

  return match
    ? Number(match[1])
    : 0;
}


function wicketValue(value) {

  if (typeof value === "number") {
    return value;
  }

  const text = String(value || "");

  const match = text.match(
    /\/\s*(\d+)/
  );

  return match
    ? Number(match[1])
    : 0;
}


function matchToObject(match) {

  if (!Array.isArray(match)) {

    let home = match?.home || "";
    let away = match?.away || "";

    if (home === "Chesara") {
      home = "Chasers";
    }

    if (away === "Chesara") {
      away = "Chasers";
    }


    return {

      id: match?.id || "",

      home,
      away,

      homeScore: scoreValue(
        match?.homeScore
      ),

      awayScore: scoreValue(
        match?.awayScore
      ),

      result: match?.result || "",

      ground: match?.ground || "",

      homeWickets: wicketValue(
        match?.homeWickets
      ),

      awayWickets: wicketValue(
        match?.awayWickets
      ),

      performance:
        performanceToObject(
          match?.performance
        )

    };

  }


  let home = match[1] || "";
  let away = match[2] || "";

  if (home === "Chesara") {
    home = "Chasers";
  }

  if (away === "Chesara") {
    away = "Chasers";
  }


  return {

    id: match[0] || "",

    home,

    away,

    homeScore: scoreValue(
      match[3]
    ),

    awayScore: scoreValue(
      match[4]
    ),

    result: match[5] || "",

    ground: match[6] || "",

    homeWickets: wicketValue(
      match[3]
    ),

    awayWickets: wicketValue(
      match[4]
    ),

    performance: {}

  };
}


/* =========================================================
   POINTS
   ========================================================= */

function pointToObject(point) {

  if (!Array.isArray(point)) {

    let team = point?.team || "";

    if (team === "Chesara") {
      team = "Chasers";
    }

    return {

      team,

      played: Number(
        point?.played || 0
      ),

      won: Number(
        point?.won || 0
      ),

      lost: Number(
        point?.lost || 0
      ),

      points: Number(
        point?.points || 0
      ),

      for: Number(
        point?.for || 0
      ),

      against: Number(
        point?.against || 0
      )

    };

  }


  let team = point[0] || "";

  if (team === "Chesara") {
    team = "Chasers";
  }


  return {

    team,

    played: Number(
      point[1] || 0
    ),

    won: Number(
      point[2] || 0
    ),

    lost: Number(
      point[3] || 0
    ),

    points: Number(
      point[4] || 0
    ),

    for: Number(
      point[5] || 0
    ),

    against: Number(
      point[6] || 0
    )

  };
}


/* =========================================================
   NORMALIZE FIREBASE DATA
   ========================================================= */

function normalizeLoadedData(data) {

  return {

    teams:
      Array.isArray(data?.teams)
        ? data.teams.map(teamToObject)
        : [],

    players:
      Array.isArray(data?.players)
        ? data.players.map(playerToObject)
        : [],

    matches:
      Array.isArray(data?.matches)
        ? data.matches.map(matchToObject)
        : [],

    points:
      Array.isArray(data?.points)
        ? data.points.map(pointToObject)
        : [],

    scorecards:
      data?.scorecards &&
      typeof data.scorecards === "object"
        ? data.scorecards
        : {}

  };

}


/* =========================================================
   FIRESTORE SAFE DATA
   ========================================================= */

function firestoreSafeData() {

  const scorecards = {};


  Object.entries(
    HPL.scorecards || {}
  ).forEach(([id, value]) => {

    scorecards[id] =
      typeof value === "string"
        ? value
        : JSON.stringify(value);

  });


  return {

    teams:
      HPL.teams.map(teamToObject),

    players:
      HPL.players.map(playerToObject),

    matches:
      HPL.matches.map(matchToObject),

    points:
      HPL.points.map(pointToObject),

    scorecards

  };

}


/* =========================================================
   CHECK IF FIREBASE IS EMPTY
   ========================================================= */

function firebaseDataIsEmpty(data) {

  const teams =
    Array.isArray(data?.teams)
      ? data.teams.length
      : 0;

  const players =
    Array.isArray(data?.players)
      ? data.players.length
      : 0;

  const matches =
    Array.isArray(data?.matches)
      ? data.matches.length
      : 0;

  const points =
    Array.isArray(data?.points)
      ? data.points.length
      : 0;

  const scorecards =
    data?.scorecards &&
    typeof data.scorecards === "object"
      ? Object.keys(data.scorecards).length
      : 0;


  return (
    teams === 0 &&
    players === 0 &&
    matches === 0 &&
    points === 0 &&
    scorecards === 0
  );
}


/* =========================================================
   IMPORT EXISTING PUBLIC app.js
   ========================================================= */

async function importExistingPublicData() {

  setStatus(
    "Firebase empty. Importing existing HPL data..."
  );


  try {

    const appUrl =
      new URL(
        "app.js",
        window.location.href
      ).href +
      "?migration=" +
      Date.now();


    const response =
      await fetch(
        appUrl,
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {
      throw new Error(
        "Could not read public app.js"
      );
    }


    const source =
      await response.text();


    /*
      Supports:

      const HPL = {...};

      or

      let HPL = {...};
    */

    const match =
      source.match(
        /(?:const|let)\s+HPL\s*=\s*(\{[\s\S]*?\});\s*const\s+\$/
      );


    if (!match) {

      throw new Error(
        "HPL data block was not found in app.js"
      );

    }


    /*
      app.js HPL is our own data object.
      Convert that object to a normal JS object.
    */

    const legacyHPL =
      new Function(
        "return (" +
        match[1] +
        ");"
      )();


    const teams
