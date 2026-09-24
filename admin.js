import{initializeApp}from'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';import{getFirestore,doc,getDoc,setDoc}from'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';import{getStorage,ref as storageRef,uploadBytes,getDownloadURL}from'https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js';import{getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut}from'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
const cfg={apiKey:'AIzaSyDW1MP5MBKoz6oOHxeWWHF7Ed8UGlsJsQ8',authDomain:'hpl-cricket-league.firebaseapp.com',projectId:'hpl-cricket-league',storageBucket:'hpl-cricket-league.firebasestorage.app',messagingSenderId:'310274398112',appId:'1:310274398112:web:4122ce31fb352d4f05b6c5',measurementId:'G-PPMME44H28'};const app=initializeApp(cfg),db=getFirestore(app),auth=getAuth(app),storage=getStorage(app),ref=doc(db,'hpl','data');const $=id=>document.getElementById(id);let HPL={teams:[],players:[],matches:[],scorecards:{}};let edit={team:-1,player:-1,match:-1};
const FALLBACK={
teams:[
{name:'Royal Kings',logo:'royal-kings.png',captain:'Sanjay',ground:'M. Chinnaswamy Stadium, Bengaluru'},
{name:'Titans',logo:'titans.png',captain:'Yashas',ground:'Narendra Modi Stadium, Ahmedabad'},
{name:'Chasers',logo:'chasers.png',captain:'Likith',ground:'Rajiv Gandhi International Cricket Stadium, Hyderabad'},
{name:'Stars',logo:'stars.png',captain:'Karan',ground:'Rajasthan International Stadium, Jaipur'}],
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
function enc(v,inArr=false){if(Array.isArray(v)){const a=v.map(x=>enc(x,true));return inArr?{__hplArray:a}:a}if(v&&typeof v==='object'){const o={};for(const[k,x]of Object.entries(v))o[k]=enc(x,false);return o}return v}function dec(v){if(Array.isArray(v))return v.map(dec);if(v&&typeof v==='object'){if(v.__hplArray&&Array.isArray(v.__hplArray))return v.__hplArray.map(dec);const o={};for(const[k,x]of Object.entries(v))o[k]=dec(x);return o}return v}
function arr(v){return Array.isArray(v)?v:[]}
function mergeByKey(fb,raw,keyFn){const out=[...arr(fb)];const idx=new Map(out.map((x,i)=>[keyFn(x),i]));for(const x of arr(raw)){const k=keyFn(x);if(idx.has(k))out[idx.get(k)]=x;else{idx.set(k,out.length);out.push(x)}}return out}
function matchKey(x){const m=normalizeMatch(x);return String(m.id??'')}
function teamKey(x){const t=normalizeTeam(x);return teamName(t.name).toLowerCase()}
function playerKey2(x){const p=normalizePlayer(x);return String(p.name||p.short||'').trim().toLowerCase()}
function scorecardMap(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}

function n(v){return Number(String(v??0).split('/')[0])||0}
function teamName(v){return String(v||'').trim()==='Chesara'?'Chasers':String(v||'').trim()}
function normalizeTeam(t){if(Array.isArray(t))return {name:teamName(t[0]),logo:t[1]||'',captain:t[2]||'',ground:t[3]||''};return {name:teamName(t?.name),logo:t?.logo||'',captain:t?.captain||'',ground:t?.ground||''}}
function normalizePlayer(p){if(Array.isArray(p))return {name:p[0]||'',short:p[1]||p[0]||'',team:teamName(p[2]),place:p[3]||'',role:p[4]||'',batting:p[5]||'',bowling:p[6]||'',jersey:p[7]||'',captain:p[8]?1:0,matches:Number(p[9])||0,runs:Number(p[10])||0,wickets:Number(p[11])||0,highest:Number(p[12])||0,fifties:Number(p[13])||0,hundreds:Number(p[14])||0};return {name:p?.name||'',short:p?.short||p?.name||'',team:teamName(p?.team),place:p?.place||'',role:p?.role||'',batting:p?.batting||'',bowling:p?.bowling||'',jersey:p?.jersey||'',captain:p?.captain?1:0,matches:Number(p?.matches)||0,runs:Number(p?.runs)||0,wickets:Number(p?.wickets)||0,highest:Number(p?.highest)||0,fifties:Number(p?.fifties)||0,hundreds:Number(p?.hundreds)||0}}
function normalizeMatch(m){if(Array.isArray(m))return {id:m[0],home:teamName(m[1]),away:teamName(m[2]),homeScore:n(m[3]),awayScore:n(m[4]),homeWickets:Number(String(m[3]??'').split('/')[1])||0,awayWickets:Number(String(m[4]??'').split('/')[1])||0,result:m[5]||'',ground:m[6]||'',date:m[7]||'',status:m[8]||((m[5]||'').toLowerCase().includes('postponed')?'Postponed':'Played')};return {id:m?.id??m?.matchId,home:teamName(m?.home),away:teamName(m?.away),homeScore:n(m?.homeScore),awayScore:n(m?.awayScore),homeWickets:Number(m?.homeWickets)||0,awayWickets:Number(m?.awayWickets)||0,result:m?.result||'',ground:m?.ground||m?.venue||'',date:m?.date||m?.matchDate||'',status:m?.status||((m?.result||'').toLowerCase().includes('postponed')?'Postponed':'Played')}}
function normalizeScorecard(x){const src=x&&x.scorecard&&typeof x.scorecard==='object'?x.scorecard:x||{};const rows=v=>Array.isArray(v)?v.map(r=>Array.isArray(r)?[r[0]??'',r[1]??null,Number(r[2]||0)]:[r?.player??r?.name??'',r?.runs??null,Number(r?.wickets||0)]):[];return {h:rows(src.h||src.home),a:rows(src.a||src.away)}}
function points(){const m={};HPL.teams.forEach(t=>m[t.name]={team:t.name,played:0,won:0,lost:0,points:0,rf:0,ra:0});HPL.matches.forEach(x=>{if(String(x.status||'Played').toLowerCase()!=='played')return;const a=teamName(x.home),b=teamName(x.away),ar=n(x.homeScore),br=n(x.awayScore);if(!m[a])m[a]={team:a,played:0,won:0,lost:0,points:0,rf:0,ra:0};if(!m[b])m[b]={team:b,played:0,won:0,lost:0,points:0,rf:0,ra:0};m[a].played++;m[b].played++;m[a].rf+=ar;m[a].ra+=br;m[b].rf+=br;m[b].ra+=ar;const r=String(x.result||'').toLowerCase();if(r.includes(a.toLowerCase()+' won')){m[a].won++;m[a].points+=2;m[b].lost++}else if(r.includes(b.toLowerCase()+' won')){m[b].won++;m[b].points+=2;m[a].lost++}});return Object.values(m).map(x=>({...x,diff:x.rf-x.ra})).sort((a,b)=>b.points-a.points||b.diff-a.diff||b.rf-a.rf)}
function msg(t,ok=true){const e=$('statusMsg')||$('loginMsg');if(e){e.textContent=t;e.className=ok?'ok':'bad'}}function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}function val(id){return $(id)?.value?.trim?.()||''}function set(id,v){if($(id))$(id).value=v??''}
async function load(){try{msg('Loading from Firebase...',true);const snap=await getDoc(ref);const raw=snap.exists()?dec(snap.data()):{};const rawTeams=arr(raw.teams).map(normalizeTeam),rawPlayers=arr(raw.players).map(normalizePlayer),rawMatches=arr(raw.matches).map(normalizeMatch);const fbTeams=FALLBACK.teams.map(normalizeTeam),fbPlayers=FALLBACK.players.map(normalizePlayer),fbMatches=FALLBACK.matches.map(normalizeMatch);HPL={teams:mergeByKey(fbTeams,rawTeams,teamKey),players:mergeByKey(fbPlayers,rawPlayers,playerKey2),matches:mergeByKey(fbMatches,rawMatches,matchKey),scorecards:{...FALLBACK.scorecards,...scorecardMap(raw.scorecards)}};HPL.teams.forEach(t=>{if(t.name==='Chasers'&&!t.ground)t.ground='Rajiv Gandhi International Cricket Stadium, Hyderabad'});HPL.scorecards=Object.fromEntries(Object.entries(HPL.scorecards).map(([k,v])=>[k,normalizeScorecard(v)]));render();msg(`Loaded: ${HPL.teams.length} teams • ${HPL.players.length} players • ${HPL.matches.length} matches.`,true)}catch(e){console.error(e);msg('Load error: '+e.message,false)}}
async function save(){try{recalc();const data={...HPL,points:points()};await setDoc(ref,enc(data),{merge:false});msg('Saved to Firebase. Public website will update live.',true)}catch(e){console.error(e);msg('Save error: '+e.message,false)}}
function render(){if($('teamCount'))$('teamCount').textContent=HPL.teams.length;if($('playerCount'))$('playerCount').textContent=HPL.players.length;if($('matchCount'))$('matchCount').textContent=HPL.matches.length;renderTeams();renderPlayers();renderMatches();renderPoints();renderSelects();renderCards()}
function renderTeams(){const l=$('teamsList');if(!l)return;l.innerHTML=HPL.teams.map((t,i)=>`<div class="admin-row"><div><div class="team-preview"><img src="${esc(t.logo||'') }" alt="${esc(t.name)} logo" onerror="this.style.display='none'"><div><b>${esc(t.name)}</b><br>Captain: ${esc(t.captain)}<br>${esc(t.ground)}</div></div></div><div class="row-actions"><button data-et="${i}">Edit</button><button data-dt="${i}">Delete</button></div></div>`).join('')}
function renderPlayers(){const l=$('playersList');if(!l)return;l.innerHTML=HPL.players.map((p,i)=>`<div class="admin-row"><div><b>${esc(p.name)}</b><br>${esc(p.team)}</div><div class="row-actions"><button data-ep="${i}">Edit</button><button data-dp="${i}">Delete</button></div></div>`).join('')}
function renderMatches(){const l=$('matchesList');if(!l)return;l.innerHTML=HPL.matches.map((m,i)=>`<div class="admin-row"><div><b>Match ${esc(m.id)}</b><br>${esc(m.home)} vs ${esc(m.away)}<br>${m.homeScore}/${m.homeWickets} vs ${m.awayScore}/${m.awayWickets}<br>${esc(m.result)}${String(m.status||'Played')!=='Played'?`<br><span class="hint">Status: ${esc(m.status)}</span>`:''}${m.date?`<br><span class="hint">Date: ${esc(m.date)}</span>`:''}</div><div class="row-actions"><button data-em="${i}">Edit</button><button data-dm="${i}">Delete</button></div></div>`).join('')}
function renderPoints(){const l=$('pointsList');if(!l)return;const p=points();l.innerHTML=p.map(x=>`<tr><td>${esc(x.team)}</td><td>${x.played}</td><td>${x.won}</td><td>${x.lost}</td><td>${x.rf}</td><td>${x.ra}</td><td>${x.diff>=0?'+':''}${x.diff}</td><td><b>${x.points}</b></td></tr>`).join('');if($('pointCount'))$('pointCount').textContent=p.length}
function renderSelects(){const s=$('playerTeam');if(s){const old=s.value;s.innerHTML='<option value="">Select team</option>'+HPL.teams.map(t=>`<option value="${esc(t.name)}">${esc(t.name)}</option>`).join('');s.value=old}const c=$('scorecardsPage');if(c){const old=c.value;c.innerHTML='<option value="">Select match</option>'+HPL.matches.map(m=>`<option value="${esc(m.id)}">Match ${esc(m.id)} — ${esc(m.home)} vs ${esc(m.away)}</option>`).join('');c.value=old}}
function renderCards(){}
function teamAdd(){const name=val('teamName');if(!name)return msg('Enter team name.',false);const t={name:teamName(name),logo:val('teamLogo'),captain:val('teamCaptain'),ground:val('teamGround')||(teamName(name)==='Chasers'?'Rajiv Gandhi International Cricket Stadium, Hyderabad':'')};if(edit.team>=0){const old=HPL.teams[edit.team].name;HPL.teams[edit.team]=t;if(old!==t.name){HPL.players.forEach(p=>{if(p.team===old)p.team=t.name});HPL.matches.forEach(m=>{if(m.home===old)m.home=t.name;if(m.away===old)m.away=t.name})}}else HPL.teams.push(t);edit.team=-1;['teamName','teamLogo','teamCaptain','teamGround'].forEach(x=>set(x,''));render();msg('Team changed. Press SAVE & UPDATE LIVE WEBSITE.',true)}function playerAdd(){const p={name:val('playerName'),short:val('playerShort'),team:teamName(val('playerTeam')),place:val('playerPlace'),role:val('playerRole'),batting:val('playerBatting'),bowling:val('playerBowling'),jersey:val('playerJersey'),matches:n(val('playerMatches')),runs:n(val('playerRuns')),wickets:n(val('playerWickets')),highest:n(val('playerHighest')),fifties:n(val('playerFifties')),hundreds:n(val('playerHundreds')),captain:$('playerCaptain')?.checked?1:0};if(!p.name)return msg('Enter player name.',false);if(edit.player>=0)HPL.players[edit.player]=p;else HPL.players.push(p);edit.player=-1;['playerName','playerShort','playerTeam','playerPlace','playerRole','playerBatting','playerBowling','playerJersey','playerMatches','playerRuns','playerWickets','playerHighest','playerFifties','playerHundreds'].forEach(x=>set(x,''));if($('playerCaptain'))$('playerCaptain').checked=false;render();msg('Player changed. Press SAVE & UPDATE LIVE WEBSITE.',true)}function matchAdd(){const id=val('matchId');if(!id)return msg('Enter match ID.',false);const status=val('matchStatus')||'Played';const m={id:Number(id)||id,home:teamName(val('matchHome')),away:teamName(val('matchAway')),homeScore:status==='Played'?n(val('matchHomeScore')):0,awayScore:status==='Played'?n(val('matchAwayScore')):0,homeWickets:status==='Played'?n(val('matchHomeWickets')):0,awayWickets:status==='Played'?n(val('matchAwayWickets')):0,result:val('matchResult')||(status==='Postponed'?'Postponed':status==='Scheduled'?'Scheduled':status==='Cancelled'?'Cancelled':''),ground:val('matchGround'),date:val('matchDate'),status};if(edit.match>=0)HPL.matches[edit.match]=m;else HPL.matches.push(m);edit.match=-1;['matchId','matchHome','matchAway','matchHomeScore','matchAwayScore','matchHomeWickets','matchAwayWickets','matchResult','matchGround','matchDate'].forEach(x=>set(x,''));set('matchStatus','Played');render();msg('Match changed. Press SAVE & UPDATE LIVE WEBSITE.',true)}function playerKey(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'')}
const SCORECARD_ALIASES={
  'sgill':'shubmangill','shubmangill':'shubmangill','vishnu':'vishnu','yashas':'yashas','sai':'sai','manavsuthar':'manavsuthar',
  'jroot':'joeroot','joeroot':'joeroot','root':'joeroot','pk':'prajwalpk','prajwalpk':'prajwalpk','likith':'likith','rahane':'ajinkyarahane','ajinkyarahane':'ajinkyarahane','vaibhav':'vaibhav',
  'sanjay':'sanjaybr','sanjaybr':'sanjaybr','darshan':'darshan','bethell':'jacobbethell','jacobbethell':'jacobbethell','cox':'jordancox','jordancox':'jordancox','bumrah':'jaspritbumrah','jaspritbumrah':'jaspritbumrah',
  'karan':'karan','mohit':'mohit','rickelton':'ryanrickelton','ryanrickelton':'ryanrickelton','benmayers':'benmayers','siyer':'shreyasiyer','shreyasiyer':'shreyasiyer','msiraj':'mohammedsiraj','mohammedsiraj':'mohammedsiraj'
};
function scorecardPlayerId(name){const k=playerKey(name);return SCORECARD_ALIASES[k]||k}
function recalcSeasonStats(){
  const byId={};
  HPL.players.forEach(p=>{byId[playerKey(p.name)]=p; if(p.short)byId[playerKey(p.short)]=p});
  const totals={};
  for(const [matchId,card] of Object.entries(HPL.scorecards||{})){
    const seen=new Set();
    const addRows=(rows)=>{for(const row of (rows||[])){
      const name=Array.isArray(row)?row[0]:row?.player??row?.name??'';
      const id=scorecardPlayerId(name); const p=byId[id]; if(!p)continue;
      if(!totals[id])totals[id]={matches:0,runs:0,wickets:0,highest:0,fifties:0,hundreds:0};
      const t=totals[id];
      if(!seen.has(id)){t.matches++;seen.add(id)}
      const runs=Array.isArray(row)?row[1]:row?.runs; const wickets=Array.isArray(row)?row[2]:row?.wickets;
      const r=runs===null||runs===undefined||runs===''?0:Number(runs)||0;
      const w=Number(wickets)||0;
      t.runs+=r;t.wickets+=w;t.highest=Math.max(t.highest,r);if(r>=100)t.hundreds++;else if(r>=50)t.fifties++;
    }};
    addRows(card?.h);addRows(card?.a);
  }
  HPL.players.forEach(p=>{
    const id=scorecardPlayerId(p.name)||scorecardPlayerId(p.short);
    const t=totals[id];
    if(t){p.matches=t.matches;p.runs=t.runs;p.wickets=t.wickets;p.highest=t.highest;p.fifties=t.fifties;p.hundreds=t.hundreds;}
  });
}
function recalc(){recalcSeasonStats();renderPoints();renderPlayers();msg('Points table and Season Player Stats recalculated from all scorecards.',true)}
async function uploadLogoAndSave(){const file=$('teamLogoFile')?.files?.[0];if(!file)return msg('Choose a logo image first.',false);const name=val('teamName');if(!name)return msg('Enter/select the team name first.',false);try{msg('Uploading logo...',true);const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const path=`hpl/team-logos/${Date.now()}-${safe}`;const r=storageRef(storage,path);await uploadBytes(r,file,{contentType:file.type||'image/png'});const url=await getDownloadURL(r);set('teamLogo',url);$('teamPreview').innerHTML=`<img src="${esc(url)}" alt="Logo preview"><span>Uploaded. Saving live...</span>`;let idx=HPL.teams.findIndex(t=>String(t.name).toLowerCase()===name.toLowerCase());const t={name,logo:url,captain:val('teamCaptain'),ground:val('teamGround')||(name==='Chasers'?'Rajiv Gandhi International Cricket Stadium, Hyderabad':'')};if(idx>=0){const old=HPL.teams[idx].name;HPL.teams[idx]={...HPL.teams[idx],...t};if(old!==name){HPL.players.forEach(p=>{if(p.team===old)p.team=name});HPL.matches.forEach(m=>{if(m[1]===old)m[1]=name;if(m[2]===old)m[2]=name})}}else HPL.teams.push(t);render();await save();if($('teamLogoFile'))$('teamLogoFile').value='';msg('Logo uploaded and LIVE website updated.',true)}catch(e){console.error(e);msg('Logo upload error: '+e.message,false)}}
function normalizeScorecardInput(x){
  const src=x&&x.scorecard&&typeof x.scorecard==='object'?x.scorecard:x||{};
  const toRows=(v)=>Array.isArray(v)?v.map(r=>{
    if(Array.isArray(r))return [r[0]??'',r[1]??null,Number(r[2]||0)];
    return [r.player??r.name??'',r.runs??null,Number(r.wickets||0)];
  }):[];
  return {h:toRows(src.h||src.home),a:toRows(src.a||src.away)};
}
async function scoreSave(){
  const raw=val('scorecardJSON');
  const id=val('scorecardsPage');
  if(!id)return msg('Select a match first.',false);
  if(!raw)return msg('Paste scorecard JSON.',false);
  try{
    const parsed=JSON.parse(raw);
    HPL.scorecards[id]=normalizeScorecardInput(parsed);
    await save();
    msg('Scorecard saved to Firebase. Public website updated LIVE.',true);
    scoreLoad();
  }catch(e){
    console.error(e);
    msg('Invalid scorecard JSON: '+e.message,false);
  }
}
function scoreLoad(){const id=val('scorecardsPage');if(!id||!HPL.scorecards[id])return;set('scorecardJSON',JSON.stringify(HPL.scorecards[id],null,2))}
$('loginBtn')?.addEventListener('click',async()=>{try{await signInWithEmailAndPassword(auth,val('email'),$('password').value);msg('Login successful.',true)}catch(e){msg(e.code==='auth/invalid-credential'?'Wrong email or password.':e.message,false)}});$('logoutBtn')?.addEventListener('click',()=>signOut(auth));$('loadBtn')?.addEventListener('click',load);$('saveBtn')?.addEventListener('click',save);$('addTeamBtn')?.addEventListener('click',teamAdd);$('addPlayerBtn')?.addEventListener('click',playerAdd);$('addMatchBtn')?.addEventListener('click',matchAdd);$('recalcBtn')?.addEventListener('click',recalc);$('saveScorecardBtn')?.addEventListener('click',scoreSave);$('loadScorecardBtn')?.addEventListener('click',scoreLoad);$('uploadLogoBtn')?.addEventListener('click',uploadLogoAndSave);$('teamLogo')?.addEventListener('input',()=>{const u=val('teamLogo');if($('teamPreview'))$('teamPreview').innerHTML=u?`<img src="${esc(u)}" alt="Logo preview"><span>Logo preview</span>`:''});$('teamLogoFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f&&$('teamPreview'))$('teamPreview').innerHTML=`<span>Selected: ${esc(f.name)}</span>`});document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===t));document.querySelectorAll('.page').forEach(x=>x.style.display=x.id===t.dataset.page?'':'none')}));$('teamsList')?.addEventListener('click',e=>{const i=e.target.dataset.et??e.target.dataset.dt;if(i===undefined)return;if(e.target.dataset.et!==undefined){const t=HPL.teams[+i];edit.team=+i;set('teamName',t.name);set('teamLogo',t.logo);set('teamCaptain',t.captain);set('teamGround',t.ground)}else{HPL.teams.splice(+i,1);render()}});$('playersList')?.addEventListener('click',e=>{const i=e.target.dataset.ep??e.target.dataset.dp;if(i===undefined)return;if(e.target.dataset.ep!==undefined){const p=HPL.players[+i];edit.player=+i;set('playerName',p.name);set('playerShort',p.short);set('playerTeam',p.team);set('playerPlace',p.place);set('playerRole',p.role);set('playerBatting',p.batting);set('playerBowling',p.bowling);set('playerJersey',p.jersey);set('playerMatches',p.matches);set('playerRuns',p.runs);set('playerWickets',p.wickets);set('playerHighest',p.highest);set('playerFifties',p.fifties);set('playerHundreds',p.hundreds);if($('playerCaptain'))$('playerCaptain').checked=!!p.captain}else{HPL.players.splice(+i,1);render()}});$('matchesList')?.addEventListener('click',e=>{const i=e.target.dataset.em??e.target.dataset.dm;if(i===undefined)return;if(e.target.dataset.em!==undefined){const m=HPL.matches[+i];edit.match=+i;set('matchId',m.id);set('matchHome',m.home);set('matchAway',m.away);set('matchHomeScore',m.homeScore);set('matchAwayScore',m.awayScore);set('matchHomeWickets',m.homeWickets);set('matchAwayWickets',m.awayWickets);set('matchResult',m.result);set('matchGround',m.ground);set('matchDate',m.date||'');set('matchStatus',m.status||'Played')}else{HPL.matches.splice(+i,1);render()}});
onAuthStateChanged(auth,user=>{if(user){$('loginScreen').classList.add('hidden');$('adminScreen').classList.remove('hidden');load()}else{$('loginScreen').classList.remove('hidden');$('adminScreen').classList.add('hidden')}});
