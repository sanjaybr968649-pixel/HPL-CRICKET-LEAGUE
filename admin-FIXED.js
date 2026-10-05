import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

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

let HPL = { teams: [], players: [], matches: [], points: [], scorecards: {}, allTimeRecords: [] };

const FALLBACK = {
  teams: [
    { name: "Royal Kings", logo: "assets/royal-kings.svg", captain: "Sanjay", ground: "M. Chinnaswamy Stadium, Bengaluru" },
    { name: "Titans", logo: "assets/titans.svg", captain: "Yashas", ground: "Narendra Modi Stadium, Ahmedabad" },
    { name: "Chasers", logo: "assets/chasers.svg", captain: "Likith", ground: "Rajiv Gandhi International Cricket Stadium, Hyderabad" },
    { name: "Stars", logo: "assets/stars.svg", captain: "Karan", ground: "Rajasthan International Stadium, Jaipur" }
  ],
  players: [], matches: [], points: [], scorecards: {},
  allTimeRecords: [
    { name:"Yashas", matches:112, runs:7025, avg:103.3, fifties:26, hundreds:25, best:307, notOut:14, ducks:8, wickets:0 },
    { name:"Sanjay", matches:110, runs:6284, avg:69.0, fifties:25, hundreds:22, best:247, notOut:19, ducks:9, wickets:0 },
    { name:"Likith", matches:115, runs:6266, avg:66.6, fifties:18, hundreds:19, best:386, notOut:21, ducks:11, wickets:0 },
    { name:"Darshan", matches:111, runs:5638, avg:67.1, fifties:25, hundreds:17, best:318, notOut:27, ducks:11, wickets:0 },
    { name:"Vishnu", matches:95, runs:4335, avg:51.6, fifties:18, hundreds:17, best:238, notOut:22, ducks:11, wickets:0 }
  ]
};

const $ = id => document.getElementById(id);
const val = id => String($(id)?.value || "").trim();
const num = id => { const n = Number(val(id)); return Number.isFinite(n) ? n : 0; };
const clean = v => String(v ?? "").trim();
const esc = v => String(v ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[m]));

function status(message, error = false) {
  const el = $("status");
  if (el) { el.textContent = message; el.style.color = error ? "#d93025" : "#16803c"; }
}
function loginMessage(message) { if ($("loginMsg")) $("loginMsg").textContent = message; }

function teamName(name) { return name === "Chesara" ? "Chasers" : clean(name); }
function logoFor(name) {
  return ({
    "Royal Kings": "assets/royal-kings.svg",
    "Titans": "assets/titans.svg",
    "Chasers": "assets/chasers.svg",
    "Stars": "assets/stars.svg"
  })[teamName(name)] || "assets/hpl.svg";
}

function rows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(r => Array.isArray(r)
    ? { name: r[0] ?? "", runs: r[1] ?? null, wickets: Number(r[2] || 0) }
    : { name: r?.name ?? r?.player ?? "", runs: r?.runs ?? null, wickets: Number(r?.wickets || 0) }
  );
}

function normalize(raw) {
  const d = raw && typeof raw === "object" ? raw : {};
  const teams = (Array.isArray(d.teams) ? d.teams : []).map(t => Array.isArray(t)
    ? { name: teamName(t[0]), logo: t[1] || logoFor(t[0]), captain: t[2] || "", ground: t[3] || "" }
    : { ...t, name: teamName(t.name), logo: t.logo || logoFor(t.name) });

  const players = (Array.isArray(d.players) ? d.players : []).map(p => Array.isArray(p)
    ? { name:p[0]||"", short:p[1]||p[0]||"", team:teamName(p[2]), place:p[3]||"", role:p[4]||"", batting:p[5]||"", bowling:p[6]||"", jersey:p[7]||"", captain:!!p[8], matches:p[9]||0, runs:p[10]||0, wickets:p[11]||0, highest:p[12]||0, fifties:p[13]||0, hundreds:p[14]||0 }
    : { ...p, team: teamName(p.team) });

  const matches = (Array.isArray(d.matches) ? d.matches : []).map(m => Array.isArray(m)
    ? { matchId:m[0], home:teamName(m[1]), away:teamName(m[2]), homeScore:String(m[3]??""), awayScore:String(m[4]??""), result:m[5]||"", ground:m[6]||"" }
    : { ...m, home:teamName(m.home), away:teamName(m.away) });

  const points = (Array.isArray(d.points) ? d.points : []).map(p => Array.isArray(p)
    ? { team:teamName(p[0]), played:p[1]||0, won:p[2]||0, lost:p[3]||0, points:p[4]||0 }
    : { ...p, team:teamName(p.team) });

  const scorecards = {};
  if (d.scorecards && typeof d.scorecards === "object") {
    Object.entries(d.scorecards).forEach(([id, sc]) => {
      if (typeof sc === "string") {
        try { scorecards[id] = JSON.parse(sc); } catch { scorecards[id] = {}; }
      } else if (sc && typeof sc === "object") {
        scorecards[id] = { ...sc, h: rows(sc.h || sc.home), a: rows(sc.a || sc.away) };
        delete scorecards[id].home;
        delete scorecards[id].away;
      }
    });
  }

  // Keep existing Firestore content, but fill missing collections from the known Season 11 data.
  const mergeBy = (current, fallback, keyFn) => {
    const out = [...current];
    const keys = new Set(out.map(keyFn));
    for (const item of fallback) {
      const key = keyFn(item);
      if (key && !keys.has(key)) { out.push(item); keys.add(key); }
    }
    return out;
  };

  return {
    teams: mergeBy(teams, FALLBACK.teams, x => teamName(x.name).toLowerCase()),
    players,
    matches,
    points,
    scorecards,
    allTimeRecords: Array.isArray(d.allTimeRecords) && d.allTimeRecords.length ? d.allTimeRecords : FALLBACK.allTimeRecords
  };
}

// Firestore forbids an array directly inside another array.
// This sanitizer converts every nested array into an object, so SAVE cannot fail with
// "Nested arrays are not supported" even when old scorecard/performance data is present.
function firestoreSafe(value, insideArray = false) {
  if (Array.isArray(value)) {
    if (insideArray) {
      const obj = {};
      value.forEach((item, i) => { obj[String(i)] = firestoreSafe(item, true); });
      return obj;
    }
    return value.map(item => firestoreSafe(item, true));
  }
  if (value && typeof value === "object") {
    const out = {};
    Object.entries(value).forEach(([k, v]) => { out[k] = firestoreSafe(v, false); });
    return out;
  }
  if (typeof value === "undefined") return null;
  if (typeof value === "number" && !Number.isFinite(value)) return null;
  return value;
}

function payload() { return firestoreSafe(HPL); }

function counts() {
  if ($("teamCount")) $("teamCount").textContent = HPL.teams.length;
  if ($("playerCount")) $("playerCount").textContent = HPL.players.length;
  if ($("matchCount")) $("matchCount").textContent = HPL.matches.length;
  if ($("pointCount")) $("pointCount").textContent = HPL.points.length;
}

function render() {
  counts();
  if ($("teamsList")) {
    $("teamsList").innerHTML = HPL.teams.map((t,i) => `
      <div class="item">
        <div style="display:flex;gap:12px;align-items:center">
          <img src="${esc(t.logo || logoFor(t.name))}" alt="${esc(t.name)} logo" style="width:52px;height:52px;object-fit:contain;background:#111;border-radius:10px" onerror="this.src='assets/hpl.svg'">
          <div><b>${esc(t.name)}</b><br>Captain: ${esc(t.captain || "")}<br>Ground: ${esc(t.ground || "")}</div>
        </div>
        <button type="button" data-edit-team="${i}">CHANGE</button>
      </div>`).join("");
    $("teamsList").querySelectorAll("[data-edit-team]").forEach(b => b.addEventListener("click", () => editTeam(Number(b.dataset.editTeam))));
  }
  if ($("playersList")) $("playersList").innerHTML = HPL.players.map(p => `<div class="item"><div><b>${esc(p.name)}</b><br>Team: ${esc(p.team)}<br>Role: ${esc(p.role)}<br>Jersey: ${esc(p.jersey)}</div></div>`).join("");
  if ($("matchesList")) $("matchesList").innerHTML = HPL.matches.map(m => `<div class="item"><div><b>Match ${esc(m.matchId)}</b><br>${esc(m.home)} ${esc(m.homeScore)} vs ${esc(m.away)} ${esc(m.awayScore)}<br>${esc(m.result)}<br>${esc(m.ground)}</div></div>`).join("");
  if ($("pointsList")) $("pointsList").innerHTML = HPL.points.map(p => `<div class="item"><div><b>${esc(p.team)}</b><br>Played: ${p.played||0} | Won: ${p.won||0} | Lost: ${p.lost||0} | Points: ${p.points||0}</div></div>`).join("");
}

async function loadData() {
  try {
    status("Loading existing HPL data...");
    const snap = await getDoc(DATA_REF);
    HPL = snap.exists() ? normalize(snap.data()) : normalize(FALLBACK);
    // IMPORTANT: LOAD only reads and displays data. It does NOT write to Firestore.
    // This prevents the previous nested-array error from appearing during LOAD.
    render();
    status(snap.exists() ? "✅ Existing HPL data loaded. Nothing was changed in Firebase." : "✅ Season 11 data loaded. Click SAVE DATA to upload it.");
  } catch (e) {
    console.error(e);
    HPL = normalize(FALLBACK);
    render();
    status("Load failed: " + (e.message || e), true);
  }
}

async function saveData() {
  try {
    status("Saving data...");
    await setDoc(DATA_REF, payload());
    status("✅ Saved to Firebase. Live website will update automatically.");
  } catch (e) {
    console.error(e);
    status("Save failed: " + (e.message || e), true);
  }
}

async function login() {
  const email = val("email"), password = $("password")?.value || "";
  if (!email || !password) return loginMessage("Email and password enter madi.");
  loginMessage("Logging in...");
  try { await signInWithEmailAndPassword(auth, email, password); loginMessage(""); }
  catch (e) { loginMessage(e.message || "Login failed."); }
}

function clearTeamForm() {
  ["teamName","teamCaptain","teamGround","teamLogo","teamLogoData","editingTeam"].forEach(id => { if ($(id)) $(id).value = ""; });
  if ($("updateTeamBtn")) $("updateTeamBtn").textContent = "UPDATE TEAM NAME / LOGO";
}
function readLogoFile() {
  return new Promise((resolve,reject) => {
    const f = $("teamLogo")?.files?.[0];
    if (!f) return resolve(val("teamLogoData"));
    if (f.size > 700000) return reject(new Error("Logo file too large. Use a small JPG/PNG/SVG."));
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("Logo read failed."));
    r.readAsDataURL(f);
  });
}
function editTeam(i) {
  const t = HPL.teams[i]; if (!t) return;
  $("editingTeam").value = String(i);
  $("teamName").value = t.name || "";
  $("teamCaptain").value = t.captain || "";
  $("teamGround").value = t.ground || "";
  $("teamLogoData").value = t.logo || "";
  $("teamLogo").value = "";
  if ($("updateTeamBtn")) $("updateTeamBtn").textContent = "UPDATE SELECTED TEAM";
  status(`Editing: ${t.name}`);
}
async function addTeam() {
  const name = clean(val("teamName"));
  if (!name) return status("Enter team name.", true);
  try {
    HPL.teams.push({ name: teamName(name), logo: await readLogoFile() || logoFor(name), captain: val("teamCaptain"), ground: val("teamGround") });
    render(); clearTeamForm(); status("Team added. Click SAVE DATA.");
  } catch (e) { status(e.message, true); }
}
async function updateTeam() {
  const i = Number(val("editingTeam")), newName = clean(val("teamName"));
  if (!Number.isInteger(i) || !HPL.teams[i]) return status("Click CHANGE on a team first.", true);
  if (!newName) return status("Enter team name.", true);
  try {
    const oldName = HPL.teams[i].name;
    const logo = await readLogoFile() || val("teamLogoData") || logoFor(newName);
    HPL.teams[i] = { ...HPL.teams[i], name: teamName(newName), logo, captain: val("teamCaptain"), ground: val("teamGround") };
    if (oldName !== HPL.teams[i].name) {
      HPL.players.forEach(p => { if (p.team === oldName) p.team = HPL.teams[i].name; });
      HPL.matches.forEach(m => { if (m.home === oldName) m.home = HPL.teams[i].name; if (m.away === oldName) m.away = HPL.teams[i].name; });
      HPL.points.forEach(p => { if (p.team === oldName) p.team = HPL.teams[i].name; });
    }
    render(); clearTeamForm(); status(`Team changed: ${oldName} → ${HPL.teams[i].name}. Click SAVE DATA.`);
  } catch (e) { status(e.message, true); }
}

function addPlayer() {
  const name = clean(val("playerName")); if (!name) return status("Enter player name.", true);
  HPL.players.push({ name, short:val("playerShort"), team:teamName(val("playerTeam")), place:val("playerPlace"), role:val("playerRole"), batting:val("playerBatting"), bowling:val("playerBowling"), jersey:val("playerJersey"), matches:0, runs:0, wickets:0, highest:0, fifties:0, hundreds:0 });
  render(); status("Player added. Click SAVE DATA.");
}
function addMatch() {
  const id = val("matchId"); if (!id) return status("Enter match ID.", true);
  let performance = [];
  try { performance = val("matchPerformance") ? JSON.parse(val("matchPerformance")) : []; } catch { return status("Player performance JSON is invalid.", true); }
  const m = { matchId:id, home:teamName(val("matchHome")), away:teamName(val("matchAway")), homeScore:num("matchHomeScore"), awayScore:num("matchAwayScore"), homeWickets:num("matchHomeWickets"), awayWickets:num("matchAwayWickets"), result:val("matchResult"), ground:val("matchGround"), performance };
  const i = HPL.matches.findIndex(x => String(x.matchId) === String(id)); if (i >= 0) HPL.matches[i] = m; else HPL.matches.push(m);
  render(); status("Match added/updated. Click SAVE DATA.");
}
function addPoint() {
  const team = teamName(val("pointTeam")); if (!team) return status("Enter team name.", true);
  const p = { team, played:num("pointPlayed"), won:num("pointWon"), lost:num("pointLost"), points:num("pointPoints") };
  const i = HPL.points.findIndex(x => x.team === team); if (i >= 0) HPL.points[i] = p; else HPL.points.push(p);
  render(); status("Points added/updated. Click SAVE DATA.");
}
function saveScorecard() {
  try {
    const data = JSON.parse(val("scorecardJSON"));
    const id = data.matchId || data.id || `M${Object.keys(HPL.scorecards).length + 1}`;
    HPL.scorecards[id] = { ...data, h:rows(data.h || data.home), a:rows(data.a || data.away) };
    delete HPL.scorecards[id].home; delete HPL.scorecards[id].away;
    render(); status("Scorecard added. Click SAVE DATA.");
  } catch { status("Invalid JSON.", true); }
}

function tabs() {
  document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".page").forEach(x => x.style.display = "none");
    const page = $(tab.dataset.page); if (page) page.style.display = "block";
  }));
}

$("loginBtn")?.addEventListener("click", login);
$("logoutBtn")?.addEventListener("click", () => signOut(auth));
$("loadBtn")?.addEventListener("click", loadData);
$("saveBtn")?.addEventListener("click", saveData);
$("addTeamBtn")?.addEventListener("click", addTeam);
$("updateTeamBtn")?.addEventListener("click", updateTeam);
$("addPlayerBtn")?.addEventListener("click", addPlayer);
$("addMatchBtn")?.addEventListener("click", addMatch);
$("addPointBtn")?.addEventListener("click", addPoint);
$("saveScorecardBtn")?.addEventListener("click", saveScorecard);
tabs();

onAuthStateChanged(auth, user => {
  if (user) { $("loginScreen")?.classList.add("hidden"); $("adminScreen")?.classList.remove("hidden"); loadData(); }
  else { $("loginScreen")?.classList.remove("hidden"); $("adminScreen")?.classList.add("hidden"); }
});
