const FALLBACK={
teams:[
{name:'Royal Kings',logo:'assets/royal-kings.svg',captain:'Sanjay',ground:'M. Chinnaswamy Stadium, Bengaluru'},
{name:'Titans',logo:'assets/titans.svg',captain:'Yashas',ground:'Narendra Modi Stadium, Ahmedabad'},
{name:'Chasers',logo:'assets/chasers.svg',captain:'Likith',ground:'Rajiv Gandhi International Cricket Stadium, Hyderabad'},
{name:'Stars',logo:'assets/stars.svg',captain:'Karan',ground:'Rajasthan International Stadium, Jaipur'}],
players:[
['Sanjay B R','Sanjay','Royal Kings','Mandya, Karnataka','All-Rounder','Right-Hand Batsman','Right-Arm Fast Bowler','02',1,4,402,1,206,0,1],
['Darshan','Darshan','Royal Kings','Tumkur, Karnataka','All-Rounder','Right-Hand Batsman','Right-Arm Off-Spin','46',0,4,42,17,38,0,0],
['Jacob Bethell','Bethell','Royal Kings','','All-Rounder','Left-Hand Batsman','','',0,4,181,0,60,2,0],
['Jordan Cox','Cox','Royal Kings','','Batsman','','','',0,4,51,0,31,0,0],
['Jasprit Bumrah','Bumrah','Royal Kings','','Bowler','','Right-Arm Fast Bowler','',0,4,45,0,34,0,0],
['Bhuvneshwar Kumar','Bhuvi','Royal Kings','','Bowler','','Right-Arm Medium-Fast','',0,0,0,0,0,0,0],
['Rashid Khan','Rashid','Royal Kings','','All-Rounder','','Right-Arm Leg Spin','',0,0,0,0,0,0,0],
['Rajat Patidar','Patidar','Royal Kings','','Batsman','Right-Hand Batsman','','',0,0,0,0,0,0,0],
['Yashas','Yashas','Titans','Tumkur, Karnataka','All-Rounder','Right-Hand Batsman','Right-Arm Medium-Fast Bowler','07',1,3,148,1,124,0,1],
['Shubman Gill','S. Gill','Titans','','Batsman','Right-Hand Batsman','','',0,3,105,0,65,1,0],
['Vishnu','Vishnu','Titans','Chitradurga, Karnataka','Batsman','Right-Hand Batsman','Right-Arm Fast-Medium Bowler','18',0,3,62,0,46,0,0],
['Sai','Sai','Titans','','Batsman','','','',0,3,60,0,40,0,0],
['Manav Suthar','Manav Suthar','Titans','','Bowler','','Left-Arm Spin','',0,3,46,9,30,0,0],
['Phil Salt','Salt','Titans','','Wicket-Keeper Batter','Right-Hand Batsman','','',0,0,0,0,0,0,0],
['Prince Yadav','Prince Yadav','Titans','','All-Rounder','','','',0,0,0,0,0,0,0],
['Angkrish Raghuvanshi','Raghuvanshi','Titans','','Batsman','Right-Hand Batsman','','',0,0,0,0,0,0,0],
['Likith','Likith','Chasers','Karnataka','All-Rounder','Right-Hand Batsman','Right-Arm Fast Bowler','18',1,3,30,0,21,0,0],
['Prajwal P.K.','Prajwal P.K.','Chasers','Bagalkot, Karnataka','Batsman','Right-Hand Batsman','Right-Arm Medium-Pace Bowler','06',0,3,143,0,73,2,0],
['Joe Root','Root','Chasers','','Batsman','Right-Hand Batsman','Right-Arm Off Spin','',0,3,80,0,34,0,0],
['Steve Smith','Smith','Chasers','','Batsman','Right-Hand Batsman','','',0,0,0,0,0,0,0],
['Vaibhav','Vaibhav','Chasers','','All-Rounder','','','',0,3,335,12,176,0,1],
['Ajinkya Rahane','Rahane','Chasers','','Batsman','Right-Hand Batsman','','',0,3,69,0,49,0,0],
['MS Dhoni','MS D','Chasers','','Wicket-Keeper Batter','Right-Hand Batsman','','',0,0,0,0,0,0,0],
['Umesh Yadav','Umesh','Chasers','','Bowler','','Right-Arm Fast','',0,0,0,0,0,0,0],
['Karan','Karan','Stars','Rajasthan','All-Rounder','Left-Hand Batsman','Left-Arm Fast Bowler','12',1,4,160,10,55,1,0],
['Mohit','Mohit','Stars','Bihar','Batsman','Right-Hand Batsman','Right-Arm Off-Spinner','44',0,4,142,0,63,1,0],
['Kagiso Rabada','Rabada','Stars','','Bowler','','Right-Arm Fast','',0,0,0,0,0,0,0],
['Mohammed Siraj','Mohammed Siraj','Stars','','Bowler','','Right-Arm Fast','',0,1,97,0,97,1,0],
['Ben Mayers','Ben Mayers','Stars','','All-Rounder','','','',0,4,98,0,44,0,0],
['Ryan Rickelton','Rickelton','Stars','','Wicket-Keeper Batter','Left-Hand Batsman','','',0,4,31,0,27,0,0],
['Yashraj Punja','Yashraj Punja','Stars','','Batsman','','','',0,0,0,0,0,0,0],
['Shreyas Iyer','S. Iyer','Stars','','Batsman','Right-Hand Batsman','','',0,3,42,0,37,0,0]],
matches:[
[1,'Titans','Chasers','222/3','219/5','Titans won by 2 wickets','Narendra Modi Stadium, Ahmedabad'],
[2,'Royal Kings','Stars','134/2','126/5','Royal Kings won by 3 wickets','M. Chinnaswamy Stadium, Bengaluru'],
[3,'Royal Kings','Chasers','224/5','230/4','Chasers won by 1 wicket','M. Chinnaswamy Stadium, Bengaluru'],
[4,'Titans','Royal Kings','251/5','135/5','Titans won by 116 runs','Narendra Modi Stadium, Ahmedabad'],
[5,'Titans','Stars','34/5','39/1','Stars won by 4 wickets','Narendra Modi Stadium, Ahmedabad'],
[6,'Stars','Chasers','170/5','238/5','Chasers won by 68 runs','Rajasthan International Stadium, Jaipur'],
[7,'Royal Kings','Stars','240/2','235/3','Royal Kings won by 3 wickets','M. Chinnaswamy Stadium, Bengaluru']],
scorecards:{
1:{h:[['S. Gill',65,0],['Vishnu',16,0],['Yashas',11,0],['Sai',40,0],['Manav Suthar',0,4]],a:[['J. Root',29,0],['P.K.',70,0],['Likith',21,0],['Rahane',49,0],['Vaibhav',20,3]]},
2:{h:[['Sanjay',40,0],['Darshan',38,5],['Bethell',56,0],['Cox',null,0],['Bumrah',null,0]],a:[['Karan',31,1],['Mohit',42,0],['Rickelton',4,0],['Ben Mayers',44,0],['S. Iyer',5,0]]},
3:{h:[['Sanjay',94,1],['Darshan',4,3],['Bethell',60,0],['Cox',20,0],['Bumrah',34,0]],a:[['J. Root',34,0],['P.K.',0,0],['Likith',0,0],['Rahane',20,0],['Vaibhav',176,4]]},
4:{h:[['S. Gill',32,0],['Vishnu',46,0],['Yashas',124,0],['Sai',19,0],['Manav Suthar',30,4]],a:[['Sanjay',62,0],['Darshan',0,4],['Bethell',31,0],['Cox',31,0],['Bumrah',11,0]]},
5:{h:[['S. Gill',8,0],['Vishnu',0,0],['Yashas',13,0],['Sai',1,0],['Manav Suthar',12,1]],a:[['Karan',31,4],['Mohit',8,0],['Rickelton',0,0],['Ben Mayers',0,0],['S. Iyer',0,0]]},
6:{h:[['Karan',43,4],['Mohit',29,0],['Rickelton',27,0],['Ben Mayers',34,0],['S. Iyer',37,0]],a:[['J. Root',17,0],['P.K.',73,0],['Likith',9,0],['Rahane',0,0],['Vaibhav',139,5]]},
7:{h:[['Sanjay',206,0],['Darshan',0,5],['Bethell',34,0],['Cox',null,0],['Bumrah',null,0]],a:[['Karan',55,1],['Mohit',63,0],['Rickelton',0,0],['Ben Mayers',20,0],['Mohammed Siraj',97,0]]}}
};
let HPL=FALLBACK;
const teamName=n=>n==='Chesara'?'Chasers':(n||'');
const scoreNum=s=>Number(String(s??0).split('/')[0])||0;
function calcPoints(matches,teams){const map={};teams.forEach(t=>map[t.name]={team:t.name,played:0,won:0,lost:0,points:0,runsFor:0,runsAgainst:0,diff:0});for(const m of matches){if(!m)continue;const a=teamName(m[1]),b=teamName(m[2]),ar=scoreNum(m[3]),br=scoreNum(m[4]);if(!map[a])map[a]={team:a,played:0,won:0,lost:0,points:0,runsFor:0,runsAgainst:0,diff:0};if(!map[b])map[b]={team:b,played:0,won:0,lost:0,points:0,runsFor:0,runsAgainst:0,diff:0};map[a].played++;map[b].played++;map[a].runsFor+=ar;map[a].runsAgainst+=br;map[b].runsFor+=br;map[b].runsAgainst+=ar;const result=String(m[5]||'').toLowerCase();if(result.includes(a.toLowerCase()+' won')){map[a].won++;map[a].points+=2;map[b].lost++}else if(result.includes(b.toLowerCase()+' won')){map[b].won++;map[b].points+=2;map[a].lost++}}return Object.values(map).map(x=>({...x,diff:x.runsFor-x.runsAgainst})).sort((a,b)=>b.points-a.points||b.diff-a.diff||b.runsFor-a.runsFor)}
function normalize(d){d=d||{};const teams=(Array.isArray(d.teams)&&d.teams.length?d.teams:FALLBACK.teams).map(t=>Array.isArray(t)?{name:teamName(t[0]),logo:t[1]||'',captain:t[2]||'',ground:t[3]||''}:{...t,name:teamName(t.name)});const players=(Array.isArray(d.players)&&d.players.length?d.players:FALLBACK.players).map(p=>Array.isArray(p)?[...p,]:[p.name||'',p.short||p.name||'',teamName(p.team),p.place||'',p.role||'',p.batting||'',p.bowling||'',p.jersey||'',p.captain?1:0,Number(p.matches)||0,Number(p.runs)||0,Number(p.wickets)||0,Number(p.highest)||0,Number(p.fifties)||0,Number(p.hundreds)||0]);const matches=(Array.isArray(d.matches)&&d.matches.length?d.matches:FALLBACK.matches).map(m=>Array.isArray(m)?[...m]:[Number(m.id||m.matchId)||m.id||m.matchId,teamName(m.home),teamName(m.away),`${Number(m.homeScore)||0}/${Number(m.homeWickets)||0}`,`${Number(m.awayScore)||0}/${Number(m.awayWickets)||0}`,m.result||'',m.ground||'']);const raw=d.scorecards&&typeof d.scorecards==='object'?d.scorecards:{};const rows=v=>Array.isArray(v)?v.map(r=>Array.isArray(r)?[r[0]??'',r[1]??null,Number(r[2]||0)]:[r.player??r.name??'',r.runs??null,Number(r.wickets||0)]):[];const scorecards=Object.keys(raw).length?Object.fromEntries(Object.entries(raw).map(([k,v])=>{const src=v&&v.scorecard&&typeof v.scorecard==='object'?v.scorecard:v||{};return[k,{h:rows(src.h||src.home),a:rows(src.a||src.away)}]})):FALLBACK.scorecards;return{teams,players,matches,scorecards}}
async function startLive(){try{const {initializeApp}=await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js');const {getFirestore,doc,onSnapshot}=await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js');const cfg={apiKey:'AIzaSyDW1MP5MBKoz6oOHxeWWHF7Ed8UGlsJsQ8',authDomain:'hpl-cricket-league.firebaseapp.com',projectId:'hpl-cricket-league',storageBucket:'hpl-cricket-league.firebasestorage.app',messagingSenderId:'310274398112',appId:'1:310274398112:web:4122ce31fb352d4f05b6c5',measurementId:'G-PPMME44H28'};const db=getFirestore(initializeApp(cfg));onSnapshot(doc(db,'hpl','data'),snap=>{if(snap.exists())HPL=normalize(snap.data());render(window.__page||'home')},e=>console.warn(e))}catch(e){console.warn(e)}}
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function logo(n){return (HPL.teams.find(t=>t.name===n)||{}).logo||({ 'Royal Kings':'assets/royal-kings.svg','Titans':'assets/titans.svg','Chasers':'assets/chasers.svg','Stars':'assets/stars.svg'}[n]||'assets/hpl.svg')}
function header(p){return `<header class="header"><div class="head"><img class="hpl-logo" src="assets/hpl.svg"><div><div class="title">HAND CRICKET PREMIER LEAGUE</div><div class="sub">Season 11 • Live Firebase Data</div></div></div></header><nav class="nav"><div class="navin">${[['home','Home'],['teams','Teams'],['players','Players'],['matches','Matches'],['points','Points Table'],['stats','Player Stats']].map(x=>`<button class="${p===x[0]?'active':''}" onclick="showPage('${x[0]}')">${x[1]}</button>`).join('')}</div></nav>`}
function mc(m){return `<article class="match"><small>MATCH ${m[0]}</small><div class="teamscore"><div class="t"><img src="${logo(m[1])}"><div><b>${esc(m[1])}</b><br><span class="score">${esc(m[3])}</span></div></div><b>VS</b><div class="t right"><div><b>${esc(m[2])}</b><br><span class="score">${esc(m[4])}</span></div><img src="${logo(m[2])}"></div></div><div class="result">${esc(m[5])}</div><div class="ground">📍 ${esc(m[6])}</div><button class="btn" onclick="scorecard(${m[0]})">View Scorecard</button></article>`}
function pointsPage(){const pts=calcPoints(HPL.matches,HPL.teams);return `<h2>Points Table</h2><p class="muted">Automatically calculated from all recorded matches. Runs For / Against and Run Difference are calculated from match scores.</p><div class="card table"><table><thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>RF</th><th>RA</th><th>Diff</th><th>Pts</th></tr></thead><tbody>${pts.map((x,i)=>`<tr><td>${i+1}</td><td><b>${esc(x.team)}</b></td><td>${x.played}</td><td>${x.won}</td><td>${x.lost}</td><td>${x.runsFor}</td><td>${x.runsAgainst}</td><td>${x.diff>=0?'+':''}${x.diff}</td><td><b>${x.points}</b></td></tr>`).join('')}</tbody></table></div>`}
function home(){const pts=calcPoints(HPL.matches,HPL.teams);return `<section class="hero"><h1>HPL Season 11</h1><p class="muted">Teams, players, live matches, scorecards and automatically calculated standings.</p></section><div class="grid g4"><div class="card"><span class="muted">Teams</span><div class="num">${HPL.teams.length}</div></div><div class="card"><span class="muted">Players</span><div class="num">${HPL.players.length}</div></div><div class="card"><span class="muted">Matches</span><div class="num">${HPL.matches.length}</div></div><div class="card"><span class="muted">Live</span><div class="num">ON</div></div></div><div class="card"><h3>Current Standings</h3><p>${pts.map(x=>`${esc(x.team)}: ${x.points} pts (${x.played} played, RF ${x.runsFor}, RA ${x.runsAgainst})`).join(' • ')}</p></div><h2>Latest Match</h2>${mc(HPL.matches[HPL.matches.length-1])}`}
function teams(){return `<h2>Teams</h2><div class="teams">${HPL.teams.map(t=>`<div class="team"><img src="${logo(t.name)}"><div><b>${esc(t.name)}</b><div>Captain: ${esc(t.captain)}</div><div class="ground">📍 ${esc(t.ground)}</div></div></div>`).join('')}</div>`}
function players(){return `<h2>Players</h2><input id="search" class="search" placeholder="Search player..." oninput="filterPlayers(this.value)"><div class="players">${HPL.players.map(p=>`<div class="player" data-name="${esc((p[0]+' '+p[1]).toLowerCase())}"><div class="avatar">${esc((p[0]||'?')[0])}</div><h3>${esc(p[1]||p[0])}${p[8]?' 🏏':''}</h3><div class="role">${esc(p[4])}</div><div class="meta">${p[3]?`📍 ${esc(p[3])}<br>`:''}${p[5]?`🏏 ${esc(p[5])}<br>`:''}${p[6]?`⚾ ${esc(p[6])}<br>`:''}${p[7]?`#${esc(p[7])}<br>`:''}<b>${p[10]||0}</b> runs • <b>${p[11]||0}</b> wickets</div></div>`).join('')}</div>`}
function filterPlayers(q){q=q.toLowerCase();document.querySelectorAll('.player').forEach(x=>x.style.display=x.dataset.name.includes(q)?'':'none')}
function matches(){return `<h2>Matches</h2>${HPL.matches.map(mc).join('')}`}
function stats(){const s=[...HPL.players].filter(p=>Number(p[9])>0).sort((a,b)=>(b[10]||0)-(a[10]||0));return `<h2>Player Stats</h2><div class="card table"><table><thead><tr><th>Player</th><th>Matches</th><th>Runs</th><th>Wickets</th><th>Highest</th><th>50s</th><th>100s</th></tr></thead><tbody>${s.map(p=>`<tr><td>${esc(p[1]||p[0])}</td><td>${p[9]}</td><td>${p[10]}</td><td>${p[11]}</td><td>${p[12]}</td><td>${p[13]}</td><td>${p[14]}</td></tr>`).join('')}</tbody></table></div>`}
function scorecard(id){const m=HPL.matches.find(x=>String(x[0])===String(id)),s=HPL.scorecards[id];if(!m||!s)return;document.getElementById('app').innerHTML=header('matches')+`<main class="wrap"><button class="btn" onclick="showPage('matches')">← Back</button><h2>Match ${id} Scorecard</h2>${mc(m)}${st(m[1],m[3],s.h)}${st(m[2],m[4],s.a)}</main><footer class="foot">HPL Season 11</footer>`;scrollTo(0,0)}
function st(t,sc,r){return `<div class="sc"><div class="sch">${esc(t)} — ${esc(sc)}</div>${(r||[]).map(x=>{const row=Array.isArray(x)?x:[x.player||x.name||'',x.runs??null,x.wickets||0];return `<div class="sr"><span>${esc(row[0])}</span><span>${row[1]===null||row[1]===undefined?'-':row[1]}</span><span class="wk">${row[2]?'│'.repeat(Number(row[2])):''}</span></div>`}).join('')}</div>`}
function render(p){window.__page=p;const body=p==='home'?home():p==='teams'?teams():p==='players'?players():p==='matches'?matches():p==='points'?pointsPage():stats();document.getElementById('app').innerHTML=header(p)+`<main class="wrap">${body}</main><footer class="foot">HAND CRICKET PREMIER LEAGUE • HPL Season 11</footer>`;scrollTo(0,0)}
window.showPage=render;window.scorecard=scorecard;window.filterPlayers=filterPlayers;render('home');startLive();
