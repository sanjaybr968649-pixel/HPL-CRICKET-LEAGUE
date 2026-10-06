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

const db = getFirestore(initializeApp(firebaseConfig));
const DATA_REF = doc(db, "hpl", "data");
const $ = id => document.getElementById(id);

let HPL = null;
let route = "home";
let selectedPlayer = "";

const TEAM_META = {
  "Royal Kings": { logo:"assets/royal-kings.png", ground:"M. Chinnaswamy Stadium, Bengaluru", captain:"Sanjay" },
  "Titans": { logo:"assets/titans.png", ground:"Narendra Modi Stadium, Ahmedabad", captain:"Yashas" },
  "Chasers": { logo:"assets/chesara.png", ground:"Rajiv Gandhi International Cricket Stadium, Hyderabad", captain:"Likith" },
  "Stars": { logo:"assets/stars.png", ground:"Rajasthan International Stadium, Jaipur", captain:"Karan" }
};

const FALLBACK_ALL_TIME = [
  {name:"Yashas",matches:112,runs:7025,avg:103.3,fifties:26,hundreds:25,best:307,notOut:14,ducks:8,wickets:0},
  {name:"Sanjay",matches:110,runs:6284,avg:69.0,fifties:25,hundreds:22,best:247,notOut:19,ducks:9,wickets:0},
  {name:"Likith",matches:115,runs:6266,avg:66.6,fifties:18,hundreds:19,best:386,notOut:21,ducks:11,wickets:0},
  {name:"Darshan",matches:111,runs:5638,avg:67.1,fifties:25,hundreds:17,best:318,notOut:27,ducks:11,wickets:0},
  {name:"Vishnu",matches:95,runs:4335,avg:51.6,fifties:18,hundreds:17,best:238,notOut:22,ducks:11,wickets:0}
];

function canonicalTeam(v){
  const s=String(v||"").trim().toLowerCase();
  if(s==="royal kings"||s==="royal-kings") return "Royal Kings";
  if(s==="titans") return "Titans";
  if(s==="chesara"||s==="chasers") return "Chasers";
  if(s==="stars") return "Stars";
  return String(v||"").trim();
}
function keyName(v){
  const s=String(v||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"");
  const aliases={
    sanjaybr:"sanjay",sanjay:"sanjay",
    shubmangill:"shubmangill",sgill:"shubmangill",
    jacobbethell:"jacobbethell",bethell:"jacobbethell",
    jordancox:"jordancox",cox:"jordancox",
    jaspritbumrah:"jaspritbumrah",bumrah:"jaspritbumrah",
    bhuvneshwarkumar:"bhuvneshwarkumar",bhuvi:"bhuvneshwarkumar",
    rashidkhan:"rashidkhan",rashid:"rashidkhan",
    rajatpatidar:"rajatpatidar",patidar:"rajatpatidar",
    philsalt:"philsalt",salt:"philsalt",
    angkrishraghuvanshi:"angkrishraghuvanshi",raghuvanshi:"angkrishraghuvanshi",
    joeroot:"joeroot",root:"joeroot",stevesmith:"stevesmith",smith:"stevesmith",
    ajinkyarahane:"ajinkyarahane",rahane:"ajinkyarahane",msd:"msd",umeshyadav:"umeshyadav",umesh:"umeshyadav",
    kagarabada:"kagarabada",rabada:"kagarabada",kagisorabada:"kagarabada",mohammedsiraj:"mohammedsiraj",
    ryanrickelton:"ryanrickelton",rickelton:"ryanrickelton",shreyasiyer:"shreyasiyer",siyer:"shreyasiyer"
  };
  return aliases[s]||s;
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
function listify(v){
  if(Array.isArray(v)) return v;
  if(v&&typeof v==="object"){
    const keys=Object.keys(v).sort((a,b)=>Number(a)-Number(b));
    if(keys.length && keys.every(k=>/^\d+$/.test(k))) return keys.map(k=>v[k]);
  }
  return [];
}
function normalizeRows(v){
  return listify(v).map(r=>Array.isArray(r)?{name:r[0]??"",runs:r[1]??null,notOut:!!r[2],wickets:num(r[3])}:{name:r?.name||r?.player||"",runs:r?.runs??null,notOut:!!r?.notOut,wickets:num(r?.wickets)});
}
function initials(name){return String(name||"?").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()}

function normalize(raw){
  const d=raw&&typeof raw==="object"?raw:{};
  const teams=(Array.isArray(d.teams)?d.teams:[]).map(t=>({
    name:canonicalTeam(t.name||t[0]),logo:t.logo||t[1]||TEAM_META[canonicalTeam(t.name||t[0])]?.logo||"",
    ground:t.ground||t[3]||TEAM_META[canonicalTeam(t.name||t[0])]?.ground||"",
    captain:t.captain||t[2]||TEAM_META[canonicalTeam(t.name||t[0])]?.captain||""
  }));
  const matches=(Array.isArray(d.matches)?d.matches:[]).map(m=>({
    no:m.no??m.matchId,home:canonicalTeam(m.home||m[1]),away:canonicalTeam(m.away||m[2]),
    homeScore:String(m.homeScore??m[3]??""),awayScore:String(m.awayScore??m[4]??""),
    winner:canonicalTeam(m.winner||m.resultWinner),margin:m.margin||"",ground:m.ground||"",status:m.status||((m.homeScore&&m.awayScore)?"Completed":"Scheduled"),players:m.players||{}
  }));
  return {
    season:d.season||11,league:d.league||"HAND CRICKET PREMIER LEAGUE",teams,matches,
    scorecards:d.scorecards&&typeof d.scorecards==="object"?d.scorecards:{},
    allTimeRecords:Array.isArray(d.allTimeRecords)?d.allTimeRecords:FALLBACK_ALL_TIME,
    players:Array.isArray(d.players)?d.players:[]
  };
}

async function loadData(){
  let local;
  try{local=normalize(await (await fetch("data.json",{cache:"no-store"})).json())}
  catch(e){local=normalize({allTimeRecords:FALLBACK_ALL_TIME})}
  try{
    const snap=await getDoc(DATA_REF);
    if(!snap.exists()) return local;
    const cloud=normalize(snap.data());
    return {...local,...cloud,
      teams:cloud.teams.length?cloud.teams:local.teams,
      matches:cloud.matches.length?cloud.matches:local.matches,
      scorecards:{...local.scorecards,...cloud.scorecards},
      players:cloud.players.length?cloud.players:local.players,
      allTimeRecords:cloud.allTimeRecords?.length?cloud.allTimeRecords:local.allTimeRecords};
  }catch(e){console.warn("Firebase read failed; using local data",e);return local}
}

function playerDirectory(){
  const map=new Map();
  for(const p of HPL.players||[]) map.set(keyName(p.name),{...p,name:p.name});
  return [...map.values()];
}
function seasonRows(){
  const out=new Map();
  const add=(name,runs,wickets,notOut,matchId)=>{
    const key=keyName(name); if(!key)return;
    const display=String(name||"").trim();
    if(!out.has(key)) out.set(key,{name:display,matches:new Set(),runs:0,wickets:0,notOut:0,fifties:0,hundreds:0,ducks:0,best:0});
    const p=out.get(key); p.matches.add(String(matchId)); const r=num(runs);
    p.runs+=r;p.wickets+=num(wickets);p.notOut+=notOut?1:0;p.best=Math.max(p.best,r);
    if(r>=100)p.hundreds++;else if(r>=50)p.fifties++;if(r===0&&!notOut)p.ducks++;
  };
  for(const m of HPL.matches){
    const id=m.no;
    const sc=HPL.scorecards[String(id)];
    let rows=[];
    if(sc) for(const side of [sc.h,sc.a,sc.home,sc.away]) rows.push(...normalizeRows(side));
    if(!rows.length&&m.players&&typeof m.players==="object") for(const arr of Object.values(m.players)) for(const row of listify(arr)){
      const r=Array.isArray(row)?{name:row[0],runs:row[1],notOut:row[2],wickets:row[3]}:row||{};
      add(r.name||r.player,r.runs,r.wickets,r.notOut,id);
    }
    else for(const r of rows) add(r.name,r.runs,r.wickets,r.notOut,id);
  }
  return [...out.values()].map(p=>({...p,matches:p.matches.size}));
}
function allTimeRows(){
  const base=new Map((HPL.allTimeRecords||FALLBACK_ALL_TIME).map(p=>[keyName(p.name),{...p}]));
  for(const s of seasonRows()){
    const k=keyName(s.name);const p=base.get(k)||{name:s.name,matches:0,runs:0,avg:null,fifties:0,hundreds:0,best:0,notOut:0,ducks:0,wickets:0};
    p.name=p.name||s.name;p.matches=num(p.matches)+s.matches;p.runs=num(p.runs)+s.runs;p.fifties=num(p.fifties)+s.fifties;p.hundreds=num(p.hundreds)+s.hundreds;p.best=Math.max(num(p.best),s.best);p.notOut=num(p.notOut)+s.notOut;p.ducks=num(p.ducks)+s.ducks;p.wickets=num(p.wickets)+s.wickets;base.set(k,p);
  }
  return [...base.values()].sort((a,b)=>num(b.runs)-num(a.runs));
}
function teamByName(name){return TEAM_META[canonicalTeam(name)]||{logo:"",ground:"",captain:""}}
function navButton(key,label){return `<button data-route="${key}" class="${route===key?"active":""}">${label}</button>`}
function matchCard(m){
  const a=teamByName(m.home),b=teamByName(m.away);
  return `<article class="card match-card"><div class="match-status">${esc(m.status||"Scheduled")}</div><div class="team-side"><img src="${esc(a.logo)}" onerror="this.style.visibility='hidden'"><strong>${esc(m.home)}</strong><div class="score">${esc(m.homeScore)}</div></div><div><div class="result">${esc(m.winner||"")}</div><div class="sub" style="text-align:center">${esc(m.margin||"Match")}</div></div><div class="team-side"><img src="${esc(b.logo)}" onerror="this.style.visibility='hidden'"><strong>${esc(m.away)}</strong><div class="score">${esc(m.awayScore)}</div></div></article>`;
}
function playerCard(p,seasonMap,allMap){
  const s=seasonMap.get(keyName(p.name))||{matches:0,runs:0,wickets:0};
  const a=allMap.get(keyName(p.name))||{};
  return `<button class="card player-card player-open" data-player="${esc(p.name)}"><div class="avatar">${initials(p.name)}</div><div class="player-main"><h3>${esc(p.name)}</h3><div class="sub">${esc(p.role||p.country||"HPL Player")}</div><div><span class="pill">S11 ${s.runs||0} runs</span><span class="pill">${a.runs||0} career</span></div></div><div class="player-arrow">›</div></button>`;
}
function proStats(o){if(!o||!Object.keys(o).length)return '<p class="sub">Stats not added yet.</p>';return `<div class="profile-stats">${stat("Matches",o.matches??"—")}${stat("Runs",o.runs??"—")}${stat("Average",o.avg??"—")}${stat("Strike Rate",o.sr??"—")}${stat("50s",o.fifties??"—")}${stat("100s",o.hundreds??"—")}${stat("Best",o.best??"—")}</div>`}
function profilePage(name){
  const p=playerDirectory().find(x=>keyName(x.name)===keyName(name));
  if(!p) return `<div class="page-title"><h1>Player not found</h1></div>`;
  const s=seasonRows().find(x=>keyName(x.name)===keyName(p.name))||{matches:0,runs:0,wickets:0,fifties:0,hundreds:0,notOut:0,ducks:0,best:0};
  const a=allTimeRows().find(x=>keyName(x.name)===keyName(p.name))||{matches:0,runs:0,avg:null,fifties:0,hundreds:0,best:0,notOut:0,ducks:0,wickets:0};
  const team=HPL.matches.flatMap(m=>Object.entries(m.players||{}).filter(([,rows])=>listify(rows).some(r=>keyName(Array.isArray(r)?r[0]:r?.name||r?.player)===keyName(p.name))).map(([t])=>canonicalTeam(t)))[0]||"";
  return `<div class="profile-head"><button class="back-btn" data-route="players">‹ Players</button><div class="profile-avatar">${initials(p.name)}</div><div><div class="eyebrow">HPL PLAYER PROFILE</div><h1>${esc(p.name)}</h1><p>${esc(p.role||"Player")} ${p.captain?"• Captain":""}</p></div></div>
  <div class="profile-grid"><div class="card profile-card"><h2>Profile</h2><div class="profile-fields"><div><span>Place</span><b>${esc(p.place||p.country||"—")}</b></div><div><span>Jersey</span><b>#${esc(p.jersey||"—")}</b></div><div><span>Batting</span><b>${esc(p.batting||"—")}</b></div><div><span>Bowling</span><b>${esc(p.bowling||"—")}</b></div>${team?`<div><span>Season 11 Team</span><b>${esc(team)}</b></div>`:""}</div></div>
  <div class="card profile-card"><h2>HPL Career</h2><div class="profile-stats">${stat("Matches",a.matches)}${stat("Runs",a.runs)}${stat("Average",a.avg??"—")}${stat("50s",a.fifties)}${stat("100s",a.hundreds)}${stat("Highest",a.best)}${stat("Not Out",a.notOut)}${stat("Ducks",a.ducks)}${stat("Wickets",a.wickets)}</div></div>
  <div class="card profile-card"><h2>Season 11</h2><div class="profile-stats">${stat("Matches",s.matches)}${stat("Runs",s.runs)}${stat("50s",s.fifties)}${stat("100s",s.hundreds)}${stat("Highest",s.best)}${stat("Not Out",s.notOut)}${stat("Ducks",s.ducks)}${stat("Wickets",s.wickets)}</div></div></div>`;
}
function stat(label,value){return `<div class="mini-stat"><span>${label}</span><strong>${esc(value)}</strong></div>`}
function dashStat(label,value){return `<div class="card stat-card"><div class="stat-label">${label}</div><div class="stat-value">${esc(value)}</div></div>`}
function pointsRows(){return [{team:"Titans",played:3,won:2,lost:1,points:4},{team:"Chasers",played:3,won:2,lost:1,points:4},{team:"Royal Kings",played:3,won:2,lost:1,points:4},{team:"Stars",played:3,won:1,lost:2,points:2}]}
function pageContent(){
  const recent=[...HPL.matches].slice(-4).reverse(); const teams=HPL.teams.length?HPL.teams:Object.entries(TEAM_META).map(([name,v])=>({name,...v}));
  const rows=allTimeRows(); const season=seasonRows(); const seasonMap=new Map(season.map(x=>[keyName(x.name),x])); const allMap=new Map(rows.map(x=>[keyName(x.name),x])); const topRuns=[...season].sort((a,b)=>b.runs-a.runs).slice(0,5);
  if(route==="profile") return profilePage(selectedPlayer);
  if(route==="matches") return `<div class="page-title"><h1>Matches</h1><p>Season 11 results and scorecards.</p></div><div class="match-list">${HPL.matches.slice().reverse().map(matchCard).join("")}</div>`;
  if(route==="season") return `<div class="page-title"><h1>Season 11</h1><p>Overview, fixtures, points table and stats.</p></div><div class="grid">${dashStat("Teams",4)}${dashStat("Matches",HPL.matches.length)}${dashStat("Top Runs",topRuns[0]?.runs||0)}${dashStat("Top Wickets",Math.max(0,...season.map(x=>x.wickets)))}</div><div class="section-head"><h2>Points Table</h2><span>Win = 2 points</span></div><div class="card table-wrap"><table class="points-table"><thead><tr><th>Team</th><th>P</th><th>W</th><th>L</th><th>Pts</th></tr></thead><tbody>${pointsRows().map(p=>`<tr><td>${esc(p.team)}</td><td>${p.played}</td><td>${p.won}</td><td>${p.lost}</td><td>${p.points}</td></tr>`).join("")}</tbody></table></div><div class="section-head"><h2>Top Season Runs</h2></div><div class="record-list">${topRuns.map(p=>`<button class="card record-row player-open" data-player="${esc(p.name)}"><div><div class="record-name">${esc(p.name)}</div><div class="record-meta">${p.matches} matches</div></div><div class="record-value">${p.runs}</div></button>`).join("")}</div>`;
  if(route==="players") return `<div class="page-title"><h1>Players</h1><p>Tap any player to open the full profile and records.</p></div><div class="player-list">${playerDirectory().map(p=>playerCard(p,seasonMap,allMap)).join("")}</div>`;
  if(route==="records") return `<div class="page-title"><h1>All-Time Records</h1><p>Historical baseline + Season 11 contributions.</p></div><div class="record-list">${rows.map(p=>`<button class="card record-row player-open" data-player="${esc(p.name)}"><div><div class="record-name">${esc(p.name)}</div><div class="record-meta">${p.matches} matches • ${p.fifties}×50 • ${p.hundreds}×100 • ${p.notOut} NO • ${p.ducks} Ducks</div></div><div style="text-align:right"><div class="record-value">${p.runs}</div><div class="record-meta">runs • best ${p.best}</div></div></button>`).join("")}</div>`;
  return `<section class="hero"><div class="hero-content"><div class="eyebrow">Hand Cricket Premier League</div><h1>HPL<br><span style="color:var(--gold)">Season 11</span></h1><div class="gold-line"></div><p>Scores, teams, player profiles, season stats and all-time records in one premium HPL dashboard.</p></div></section><div class="grid">${stat("Matches",HPL.matches.length)}${stat("Teams",4)}${stat("Top Runs",topRuns[0]?.runs||0)}${stat("Top Wickets",Math.max(0,...season.map(x=>x.wickets)))}</div><div class="section-head"><h2>Quick Access</h2><span>Season 11</span></div><div class="quick"><button data-route="matches"><strong>Schedule</strong><small>Matches & results</small></button><button data-route="season"><strong>Points Table</strong><small>Wins and points</small></button><button data-route="players"><strong>Players</strong><small>Open profiles</small></button><button data-route="records"><strong>All-Time Records</strong><small>Career totals</small></button></div><div class="section-head"><h2>Recent Matches</h2><button data-route="matches" class="text-link">View all</button></div><div class="match-list">${recent.map(matchCard).join("")}</div><div class="section-head"><h2>Teams</h2></div><div class="team-list">${teams.map(t=>`<article class="card team-card"><img src="${esc(t.logo||teamByName(t.name).logo)}" onerror="this.style.visibility='hidden'"><div><h3>${esc(canonicalTeam(t.name))}</h3><div class="sub">Captain: ${esc(t.captain||teamByName(t.name).captain)}</div><div class="sub">${esc(t.ground||teamByName(t.name).ground)}</div></div></article>`).join("")}</div>`;
}

function render(){
  const root=$("app"); root.innerHTML=`<header class="topbar"><button class="brand brand-button" data-route="home"><img class="brand-mark" src="assets/hpl.png" onerror="this.src='assets/royal-kings.png'"><div><div class="brand-title">HPL SEASON 11</div><div class="brand-sub">HAND CRICKET PREMIER LEAGUE</div></div></button><div class="top-actions"><button class="icon-btn" id="searchBtn">⌕</button><button class="icon-btn" id="infoBtn">i</button></div></header><main class="main">${pageContent()}</main><nav class="bottom-nav">${navButton("home","Home")}${navButton("matches","Matches")}${navButton("season","Season")}${navButton("players","Players")}${navButton("records","More")}</nav><div id="toast" class="toast"></div>`;
  root.querySelectorAll("[data-route]").forEach(b=>b.addEventListener("click",()=>{route=b.dataset.route;selectedPlayer="";render();window.scrollTo({top:0,behavior:"smooth"})}));
  root.querySelectorAll(".player-open").forEach(b=>b.addEventListener("click",()=>{selectedPlayer=b.dataset.player;route="profile";render();window.scrollTo({top:0,behavior:"smooth"})}));
  $("searchBtn")?.addEventListener("click",()=>route="players");
  $("searchBtn")?.addEventListener("click",()=>render());
  $("infoBtn")?.addEventListener("click",()=>toast("Season 11 • 4 teams • hand-cricket format"));
}
function toast(msg){const t=$("toast");if(!t)return;t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}

async function start(){
  const opening=$("opening"),bar=$("loadingBar"),pct=$("loadingPercent"),open=$("openHpl");
  let progress=0;
  const timer=setInterval(()=>{progress=Math.min(100,progress+2);bar.style.width=progress+"%";pct.textContent=progress+"%";if(progress>=100){clearInterval(timer);open.disabled=false;open.classList.add("ready")}},35);
  open.addEventListener("click",async()=>{opening.classList.add("is-hidden");$("app").classList.remove("is-hidden");HPL=await loadData();render()},{once:true});
}
start();
