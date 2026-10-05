import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

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
const DATA_REF = doc(db, "hpl", "data");

const $ = id => document.getElementById(id);
let HPL = null;
let route = "home";

const FALLBACK_ALL_TIME = [
  {name:"Yashas",matches:112,runs:7025,avg:103.3,fifties:26,hundreds:25,best:307,notOut:14,ducks:8,wickets:0},
  {name:"Sanjay",matches:110,runs:6284,avg:69.0,fifties:25,hundreds:22,best:247,notOut:19,ducks:9,wickets:0},
  {name:"Likith",matches:115,runs:6266,avg:66.6,fifties:18,hundreds:19,best:386,notOut:21,ducks:11,wickets:0},
  {name:"Darshan",matches:111,runs:5638,avg:67.1,fifties:25,hundreds:17,best:318,notOut:27,ducks:11,wickets:0},
  {name:"Vishnu",matches:95,runs:4335,avg:51.6,fifties:18,hundreds:17,best:238,notOut:22,ducks:11,wickets:0}
];

const TEAM_META = {
  "Royal Kings": {id:"royal-kings",logo:"assets/royal-kings.png",ground:"M. Chinnaswamy Stadium, Bengaluru",captain:"Sanjay"},
  "Titans": {id:"titans",logo:"assets/titans.png",ground:"Narendra Modi Stadium, Ahmedabad",captain:"Yashas"},
  "Chasers": {id:"chasers",logo:"assets/chesara.png",ground:"Rajiv Gandhi International Cricket Stadium, Hyderabad",captain:"Likith"},
  "Stars": {id:"stars",logo:"assets/stars.png",ground:"Rajasthan International Stadium, Jaipur",captain:"Karan"}
};

function teamName(v){return String(v||"").trim()==="Chesara"?"Chasers":String(v||"").trim()}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
function scoreParts(v){const s=String(v??"");const m=s.match(/^(\d+)\s*(?:\/\s*(\d+))?/);return {runs:m?Number(m[1]):0,wickets:m&&m[2]?Number(m[2]):0}}

function listify(v){
  if(Array.isArray(v)) return v;
  if(v&&typeof v==="object"){
    const keys=Object.keys(v).sort((a,b)=>Number(a)-Number(b));
    if(keys.every(k=>/^\d+$/.test(k))) return keys.map(k=>v[k]);
  }
  return [];
}
function normalizeRows(v){
  return listify(v).map(r=>{
    if(Array.isArray(r)) return {name:r[0]??"",runs:r[1]??null,notOut:!!r[2],wickets:num(r[3])};
    return {name:r?.name||r?.player||"",runs:r?.runs??null,notOut:!!r?.notOut,wickets:num(r?.wickets)};
  });
}
function initials(name){return String(name||"?").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()}

function normalize(raw){
  const d=raw&&typeof raw==="object"?raw:{};
  const teams=(Array.isArray(d.teams)?d.teams:[]).map(t=>({name:teamName(t.name||t[0]),logo:t.logo||t[1]||TEAM_META[teamName(t.name||t[0])]?.logo||"",ground:t.ground||t[3]||TEAM_META[teamName(t.name||t[0])]?.ground||"",captain:t.captain||t[2]||TEAM_META[teamName(t.name||t[0])]?.captain||""}));
  const matches=(Array.isArray(d.matches)?d.matches:[]).map(m=>({no:m.no??m.matchId,home:teamName(m.home||m[1]),away:teamName(m.away||m[2]),homeScore:String(m.homeScore??m[3]??""),awayScore:String(m.awayScore??m[4]??""),winner:teamName(m.winner||m.resultWinner),margin:m.margin||"",ground:m.ground||"",players:m.players||{}}));
  const scorecards={};
  Object.entries(d.scorecards||{}).forEach(([id,sc])=>scorecards[id]=sc);
  return {season:d.season||11,league:d.league||"HAND CRICKET PREMIER LEAGUE",teams,matches,scorecards,allTimeRecords:Array.isArray(d.allTimeRecords)?d.allTimeRecords:FALLBACK_ALL_TIME,players:Array.isArray(d.players)?d.players:[]};
}

async function loadData(){
  let fallback={};
  try{fallback=normalize(await (await fetch("data.json",{cache:"no-store"})).json())}catch(e){fallback=normalize({allTimeRecords:FALLBACK_ALL_TIME})}
  try{
    const snap=await getDoc(DATA_REF);
    if(!snap.exists())return fallback;
    const cloud=normalize(snap.data());
    return {
      ...fallback,
      ...cloud,
      teams:cloud.teams.length?cloud.teams:fallback.teams,
      matches:cloud.matches.length?cloud.matches:fallback.matches,
      scorecards:{...fallback.scorecards,...cloud.scorecards},
      allTimeRecords:cloud.allTimeRecords?.length?cloud.allTimeRecords:fallback.allTimeRecords
    };
  }catch(e){console.warn("Firebase read failed; using local data",e);return fallback}
}

function seasonRows(){
  const out=new Map();
  const add=(name,runs,wickets,notOut,matchId)=>{
    const key=String(name||"").trim();if(!key)return;
    if(!out.has(key))out.set(key,{name:key,matches:new Set(),runs:0,wickets:0,notOut:0,fifties:0,hundreds:0,ducks:0,best:0});
    const p=out.get(key);p.matches.add(String(matchId));const r=num(runs);p.runs+=r;p.wickets+=num(wickets);p.notOut+=notOut?1:0;p.best=Math.max(p.best,r);if(r>=100)p.hundreds++;else if(r>=50)p.fifties++;if(r===0&&!notOut)p.ducks++;
  };
  for(const m of HPL.matches){
    const id=m.no??m.matchId;
    const sc=HPL.scorecards[String(id)];
    const scorecardRows=[];
    if(sc){
      for(const side of [sc.h,sc.a,sc.home,sc.away]) scorecardRows.push(...normalizeRows(side));
    }
    if(scorecardRows.length){
      for(const r of scorecardRows) add(r.name,r.runs,r.wickets,r.notOut,id);
    }else if(m.players&&typeof m.players==="object") {
      for(const arr of Object.values(m.players)) for(const row of listify(arr)){ const r=Array.isArray(row)?{name:row[0],runs:row[1],notOut:row[2],wickets:row[3]}:row||{}; add(r.name||r.player,r.runs,r.wickets,r.notOut,id); }
    }
  }
  return [...out.values()].map(p=>({...p,matches:p.matches.size}));
}

function allTimeRows(){
  const base=new Map((HPL.allTimeRecords||FALLBACK_ALL_TIME).map(p=>[String(p.name).toLowerCase(),{...p}]))
  const season=seasonRows();
  for(const s of season){
    const k=s.name.toLowerCase();
    const p=base.get(k)||{name:s.name,matches:0,runs:0,avg:null,fifties:0,hundreds:0,best:0,notOut:0,ducks:0,wickets:0};
    p.name=p.name||s.name;p.matches=num(p.matches)+s.matches;p.runs=num(p.runs)+s.runs;p.fifties=num(p.fifties)+s.fifties;p.hundreds=num(p.hundreds)+s.hundreds;p.best=Math.max(num(p.best),s.best);p.notOut=num(p.notOut)+s.notOut;p.ducks=num(p.ducks)+s.ducks;p.wickets=num(p.wickets)+s.wickets;
    // The supplied historical average is retained because historical innings/dismissals are not fully supplied.
    base.set(k,p);
  }
  for(const p of HPL.players||[]){const k=String(p.name||"").toLowerCase();if(k&&!base.has(k))base.set(k,{name:p.name,matches:0,runs:0,avg:null,fifties:0,hundreds:0,best:0,notOut:0,ducks:0,wickets:0})}
  return [...base.values()].sort((a,b)=>num(b.runs)-num(a.runs));
}

function teamByName(name){return TEAM_META[teamName(name)]||{logo:"",ground:"",captain:""}}
function matchCard(m){const a=teamByName(m.home),b=teamByName(m.away);return `<article class="card match-card"><div class="team-side"><img src="${esc(a.logo)}" onerror="this.style.visibility='hidden'"><strong>${esc(m.home)}</strong><div class="sub">${esc(m.homeScore)}</div></div><div><div class="result">${esc(m.winner||"")}</div><div class="sub" style="text-align:center">${esc(m.margin||"Match")}</div></div><div class="team-side"><img src="${esc(b.logo)}" onerror="this.style.visibility='hidden'"><strong>${esc(m.away)}</strong><div class="sub">${esc(m.awayScore)}</div></div></article>`}
function navButton(key,label){return `<button data-route="${key}" class="${route===key?"active":""}">${label}</button>`}

function render(){
  const root=$("app");
  const recent=[...HPL.matches].slice(-4).reverse();
  const teams=HPL.teams.length?HPL.teams:Object.entries(TEAM_META).map(([name,v])=>({name,...v}));
  const rows=allTimeRows();
  const season=seasonRows();
  const topRuns=[...season].sort((a,b)=>b.runs-a.runs).slice(0,5);
  root.innerHTML=`<header class="topbar"><a class="brand" href="#"><img class="brand-mark" src="${esc(teamByName("Royal Kings").logo)}" onerror="this.src='assets/hpl-opening.jpg'"><div><div class="brand-title">HPL SEASON 11</div><div class="brand-sub">HAND CRICKET PREMIER LEAGUE</div></div></a><div class="top-actions"><button class="icon-btn" id="searchBtn">⌕</button><button class="icon-btn" id="infoBtn">i</button></div></header><main class="main">${pageContent(recent,teams,rows,topRuns,season)}</main><nav class="bottom-nav">${navButton("home","Home")}${navButton("matches","Matches")}${navButton("season","Season")}${navButton("players","Players")}${navButton("records","More")}</nav><div id="toast" class="toast"></div>`;
  root.querySelectorAll("[data-route]").forEach(b=>b.addEventListener("click",()=>{route=b.dataset.route;render();window.scrollTo({top:0,behavior:"smooth"})}));
  $("searchBtn")?.addEventListener("click",()=>toast("Use Players or Records to browse HPL data."));
  $("infoBtn")?.addEventListener("click",()=>toast("Season 11 • 4 teams • hand-cricket format"));
}

function pageContent(recent,teams,rows,topRuns,season){
  if(route==="matches")return `<div class="page-title"><h1>Matches</h1><p>Season 11 results and scorelines.</p></div><div class="match-list">${HPL.matches.slice().reverse().map(matchCard).join("")}</div>`;
  if(route==="season")return `<div class="page-title"><h1>Season 11</h1><p>Overview, points and leading performers.</p></div><div class="tabs"><button class="active">Overview</button><button>Fixtures</button><button>Points Table</button><button>Stats</button></div><div class="grid"><div class="card stat-card"><div class="stat-label">Teams</div><div class="stat-value">4</div></div><div class="card stat-card"><div class="stat-label">Matches</div><div class="stat-value">${HPL.matches.length}</div></div><div class="card stat-card"><div class="stat-label">Top Runs</div><div class="stat-value">${num(topRuns[0]?.runs)}</div></div><div class="card stat-card"><div class="stat-label">Top Wickets</div><div class="stat-value">${Math.max(0,...season.map(x=>x.wickets))}</div></div></div><div class="section-head"><h2>Points Table</h2><span>Wins = 2 points</span></div><div class="card table-wrap"><table class="points-table"><thead><tr><th>Team</th><th>P</th><th>W</th><th>L</th><th>Pts</th></tr></thead><tbody>${pointsRows().map(p=>`<tr><td>${esc(p.team)}</td><td>${p.played}</td><td>${p.won}</td><td>${p.lost}</td><td>${p.points}</td></tr>`).join("")}</tbody></table></div><div class="section-head"><h2>Top Season Runs</h2></div><div class="record-list">${topRuns.map(p=>`<div class="card record-row"><div><div class="record-name">${esc(p.name)}</div><div class="record-meta">${p.matches} matches</div></div><div class="record-value">${p.runs}</div></div>`).join("")}</div>`;
  if(route==="players")return `<div class="page-title"><h1>Players</h1><p>Season 11 player profiles and performance.</p></div><div class="player-list">${[...season].sort((a,b)=>b.runs-a.runs).map(p=>`<article class="card player-card"><div class="avatar">${initials(p.name)}</div><div><h3>${esc(p.name)}</h3><span class="pill">${p.matches} matches</span> <span class="pill">${p.runs} runs</span> <span class="pill">${p.wickets} wickets</span></div></article>`).join("")}</div>`;
  if(route==="records")return `<div class="page-title"><h1>All-Time Records</h1><p>Historical baseline + Season 11 contributions, without double-counting a match.</p></div><div class="tabs"><button class="active">Batting</button></div><div class="record-list">${rows.map(p=>`<div class="card record-row"><div><div class="record-name">${esc(p.name)}</div><div class="record-meta">${p.matches} matches • ${p.fifties}×50 • ${p.hundreds}×100 • ${p.notOut} NO • ${p.ducks} Ducks</div></div><div style="text-align:right"><div class="record-value">${p.runs}</div><div class="record-meta">runs • best ${p.best}</div></div></div>`).join("")}</div>`;
  return `<section class="hero"><div class="hero-content"><div class="eyebrow">Hand Cricket Premier League</div><h1>HPL<br><span style="color:var(--gold)">Season 11</span></h1><div class="gold-line"></div><p>A premium home for HPL scores, teams, players, season stats and all-time records.</p></div></section><div class="grid"><div class="card stat-card"><div class="stat-label">Matches</div><div class="stat-value">${HPL.matches.length}</div></div><div class="card stat-card"><div class="stat-label">Teams</div><div class="stat-value">4</div></div><div class="card stat-card"><div class="stat-label">Top Runs</div><div class="stat-value">${num(topRuns[0]?.runs)}</div></div><div class="card stat-card"><div class="stat-label">Top Wickets</div><div class="stat-value">${Math.max(0,...season.map(x=>x.wickets))}</div></div></div><div class="section-head"><h2>Quick Access</h2><span>Season 11</span></div><div class="quick"><button data-route="matches"><strong>Schedule</strong><small>Matches & results</small></button><button data-route="season"><strong>Points Table</strong><small>Wins and points</small></button><button data-route="players"><strong>Teams & Players</strong><small>Squads and stats</small></button><button data-route="records"><strong>All-Time Records</strong><small>Career totals</small></button></div><div class="section-head"><h2>Recent Matches</h2><button data-route="matches" style="border:0;background:none;color:var(--gold);font-size:11px">View all</button></div><div class="match-list">${recent.map(matchCard).join("")}</div><div class="section-head"><h2>Teams</h2></div><div class="team-list">${teams.map(t=>`<article class="card team-card"><img src="${esc(t.logo||teamByName(t.name).logo)}" onerror="this.style.visibility='hidden'"><div><h3>${esc(t.name)}</h3><div class="sub">Captain: ${esc(t.captain||teamByName(t.name).captain)}</div><div class="sub">${esc(t.ground||teamByName(t.name).ground)}</div></div></article>`).join("")}</div>`;
}

function pointsRows(){return [{team:"Titans",played:3,won:2,lost:1,points:4},{team:"Chasers",played:3,won:2,lost:1,points:4},{team:"Royal Kings",played:3,won:2,lost:1,points:4},{team:"Stars",played:3,won:1,lost:2,points:2}]}
function toast(msg){const t=$("toast");if(!t)return;t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}

async function start(){
  const opening=$("opening"),bar=$("loadingBar"),pct=$("loadingPercent"),open=$("openHpl");
  let progress=0;
  const timer=setInterval(()=>{progress=Math.min(100,progress+2);bar.style.width=progress+"%";pct.textContent=progress+"%";if(progress>=100){clearInterval(timer);open.disabled=false}},35);
  open.addEventListener("click",async()=>{opening.classList.add("is-hidden");$("app").classList.remove("is-hidden");HPL=await loadData();render()},{once:true});
}
start();
