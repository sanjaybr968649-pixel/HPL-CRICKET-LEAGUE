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


const firebaseConfig = {

  apiKey: "AIzaSyDW1MP5MBKoz6oOHxeWWHF7Ed8UGlsJsQ8",

  authDomain:
    "hpl-cricket-league.firebaseapp.com",

  projectId:
    "hpl-cricket-league",

  storageBucket:
    "hpl-cricket-league.firebasestorage.app",

  messagingSenderId:
    "310274398112",

  appId:
    "1:310274398112:web:4122ce31fb352d4f05b6c5",

  measurementId:
    "G-PPMME44H28"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


let HPL = {
  teams: [],
  players: [],
  matches: [],
  points: [],
  scorecards: {}
};


const dataRef = doc(db, "hpl", "data");


/* LOGIN */

document.getElementById("loginBtn").onclick = async () => {

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  const msg =
    document.getElementById("loginMsg");

  if (!email || !password) {
    msg.textContent = "Enter email and password";
    return;
  }

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    msg.textContent = "";

  } catch (error) {

    console.error(error);

    msg.textContent =
      "Login failed: " + error.message;
  }
};


/* AUTH CHECK */

onAuthStateChanged(auth, user => {

  if (user) {

    document.getElementById("loginBox")
      .style.display = "none";

    document.getElementById("adminPanel")
      .style.display = "block";

    loadData();

  } else {

    document.getElementById("loginBox")
      .style.display = "block";

    document.getElementById("adminPanel")
      .style.display = "none";
  }

});


/* LOGOUT */

document.getElementById("logoutBtn").onclick =
  () => signOut(auth);


/* TABS */

document.querySelectorAll(".tab").forEach(button => {

  button.onclick = () => {

    document.querySelectorAll(".tab")
      .forEach(x => x.classList.remove("active"));

    document.querySelectorAll(".page")
      .forEach(x => x.classList.remove("active"));

    button.classList.add("active");

    document.getElementById(
      button.dataset.tab
    ).classList.add("active");

  };

});


/* LOAD FIRESTORE */

async function loadData() {

  try {

    const snapshot = await getDoc(dataRef);

    if (snapshot.exists()) {

      HPL = snapshot.data();

      HPL.teams ||= [];
      HPL.players ||= [];
      HPL.matches ||= [];
      HPL.points ||= [];
      HPL.scorecards ||= {};

      render();

      status("Data loaded successfully.");

    } else {

      status(
        "No HPL data found in Firestore. Add your data first."
      );

      render();
    }

  } catch (error) {

    console.error(error);

    status(
      "Could not load data: " + error.message
    );
  }
}


document.getElementById("loadBtn").onclick =
  loadData;


/* SAVE FIRESTORE */

async function saveData() {

  try {

    await setDoc(dataRef, HPL);

    status("✅ HPL data saved to Firebase!");

  } catch (error) {

    console.error(error);

    status(
      "❌ Save failed: " + error.message
    );
  }
}


document.getElementById("saveBtn").onclick =
  saveData;


/* STATUS */

function status(message) {

  document.getElementById("status")
    .textContent = message;
}


/* RENDER */

function render() {

  document.getElementById("teamCount")
    .textContent = HPL.teams.length;

  document.getElementById("playerCount")
    .textContent = HPL.players.length;

  document.getElementById("matchCount")
    .textContent = HPL.matches.length;


  renderTeams();

  renderPlayers();

  renderMatches();

  renderPoints();

  document.getElementById("scorecardJSON")
    .value =
    JSON.stringify(
      HPL.scorecards,
      null,
      2
    );
}


/* TEAMS */

function renderTeams() {

  const box =
    document.getElementById("teamsList");

  box.innerHTML = "";

  HPL.teams.forEach((team, index) => {

    box.innerHTML += `

      <div class="item">

        <div>
          <b>${escapeHTML(team.name)}</b><br>
          Captain:
          ${escapeHTML(team.captain || "")}<br>
          ${escapeHTML(team.ground || "")}
        </div>

        <button
          class="delete"
          onclick="deleteTeam(${index})">
          DELETE
        </button>

      </div>
    `;
  });
}


document.getElementById("addTeam").onclick = () => {

  const team = {

    name:
      document.getElementById("teamName").value.trim(),

    logo:
      document.getElementById("teamLogo").value.trim(),

    captain:
      document.getElementById("teamCaptain").value.trim(),

    ground:
      document.getElementById("teamGround").value.trim()
  };


  if (!team.name) {

    alert("Enter team name");

    return;
  }


  HPL.teams.push(team);

  saveData();

  render();

};


window.deleteTeam = index => {

  if (
    confirm(
      "Delete this team?"
    )
  ) {

    HPL.teams.splice(index, 1);

    saveData();

    render();
  }

};


/* PLAYERS */

function renderPlayers() {

  const box =
    document.getElementById("playersList");

  box.innerHTML = "";

  HPL.players.forEach((p, index) => {

    box.innerHTML += `

      <div class="item">

        <div>

          <b>${escapeHTML(p[0])}</b>

          (${escapeHTML(p[1])})<br>

          Team:
          ${escapeHTML(p[2])}<br>

          Role:
          ${escapeHTML(p[4])}

        </div>

        <button
          class="delete"
          onclick="deletePlayer(${index})">

          DELETE

        </button>

      </div>
    `;
  });
}


document.getElementById("addPlayer").onclick = () => {

  const p = [

    document.getElementById("playerName").value.trim(),

    document.getElementById("playerShort").value.trim(),

    document.getElementById("playerTeam").value.trim(),

    document.getElementById("playerPlace").value.trim(),

    document.getElementById("playerRole").value.trim(),

    document.getElementById("playerBatting").value.trim(),

    document.getElementById("playerBowling").value.trim(),

    document.getElementById("playerNumber").value.trim(),

    0, 0, 0, 0, 0, 0, 0

  ];


  if (!p[0] || !p[2]) {

    alert(
      "Enter player name and team"
    );

    return;
  }


  HPL.players.push(p);

  saveData();

  render();

};


window.deletePlayer = index => {

  if (
    confirm(
      "Delete this player?"
    )
  ) {

    HPL.players.splice(index, 1);

    saveData();

    render();
  }

};


/* MATCHES */

function renderMatches() {

  const box =
    document.getElementById("matchesList");

  box.innerHTML = "";

  HPL.matches.forEach((m, index) => {

    box.innerHTML += `

      <div class="item">

        <div>

          <b>Match ${m[0]}</b><br>

          ${escapeHTML(m[1])}
          vs
          ${escapeHTML(m[2])}<br>

          ${escapeHTML(m[3])}
          -
          ${escapeHTML(m[4])}<br>

          ${escapeHTML(m[5])}

        </div>

        <button
          class="delete"
          onclick="deleteMatch(${index})">

          DELETE

        </button>

      </div>
    `;
  });
}


document.getElementById("addMatch").onclick = () => {

  const m = [

    Number(
      document.getElementById("matchId").value
    ),

    document.getElementById("matchHome")
      .value.trim(),

    document.getElementById("matchAway")
      .value.trim(),

    document.getElementById("matchHomeScore")
      .value.trim(),

    document.getElementById("matchAwayScore")
      .value.trim(),

    document.getElementById("matchResult")
      .value.trim(),

    document.getElementById("matchGround")
      .value.trim()

  ];


  if (!m[0] || !m[1] || !m[2]) {

    alert("Enter match details");

    return;
  }


  HPL.matches.push(m);

  saveData();

  render();

};


window.deleteMatch = index => {

  if (
    confirm(
      "Delete this match?"
    )
  ) {

    HPL.matches.splice(index, 1);

    saveData();

    render();
  }

};


/* POINTS TABLE */

function renderPoints() {

  const box =
    document.getElementById("pointsList");

  box.innerHTML = "";

  HPL.points.forEach((p, index) => {

    box.innerHTML += `

      <div class="item">

        <div>

          <b>${escapeHTML(p[0])}</b>

          — Played ${p[1]},
          Won ${p[2]},
          Lost ${p[3]},
          Points ${p[4]}

        </div>

        <button
          class="delete"
          onclick="deletePoints(${index})">

          DELETE

        </button>

      </div>
    `;
  });
}


document.getElementById("addPoints").onclick = () => {

  const p = [

    document.getElementById("pointsTeam")
      .value.trim(),

    Number(
      document.getElementById("played").value
    ),

    Number(
      document.getElementById("won").value
    ),

    Number(
      document.getElementById("lost").value
    ),

    Number(
      document.getElementById("pointsValue").value
    )

  ];


  if (!p[0]) {

    alert("Enter team");

    return;
  }


  HPL.points.push(p);

  saveData();

  render();

};


window.deletePoints = index => {

  if (
    confirm(
      "Delete this points entry?"
    )
  ) {

    HPL.points.splice(index, 1);

    saveData();

    render();
  }

};


/* SCORECARDS */

document.getElementById(
  "saveScorecards"
).onclick = () => {

  try {

    HPL.scorecards =
      JSON.parse(
        document.getElementById(
          "scorecardJSON"
        ).value
      );

    saveData();

    alert(
      "✅ Scorecards saved!"
    );

  } catch {

    alert(
      "❌ Invalid JSON"
    );
  }

};


/* HTML SECURITY */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
