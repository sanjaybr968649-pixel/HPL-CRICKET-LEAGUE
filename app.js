window.showPage=showPage;
window.scorecard=scorecard;
window.filterPlayers=filterPlayers;

/* ================================
   FIREBASE LIVE DATA CONNECTION
   ================================ */

async function loadFirebaseHPL(){

  try{

    const { initializeApp } =
      await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js");

    const { getFirestore, doc, getDoc } =
      await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js");

    const firebaseConfig = {
      apiKey: "AIzaSyDW1MP5MBKoz6oOHxeWWHF7Ed8UGlsJsQ8",
      authDomain: "hpl-cricket-league.firebaseapp.com",
      projectId: "hpl-cricket-league",
      storageBucket: "hpl-cricket-league.firebasestorage.app",
      messagingSenderId: "310274398112",
      appId: "1:310274398112:web:4122ce31fb352d4f05b6c5",
      measurementId: "G-PPMME44H28"
    };

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);

    const snap = await getDoc(doc(db,"hpl","data"));

    /*
      Firebase empty ಇದ್ದರೆ existing website data ಉಳಿಯುತ್ತದೆ.
      ಆದ್ದರಿಂದ website blank ಆಗುವುದಿಲ್ಲ.
    */
    if(!snap.exists()){
      showPage('home');
      return;
    }

    const data = snap.data();

    /* ---------- TEAMS ---------- */

    if(Array.isArray(data.teams) && data.teams.length){

      HPL.teams = data.teams.map(t => {

        const name = t.name || "";

        return {
          name: name === "Chesara" ? "Chasers" : name,
          logo: t.logo || "",
          captain: t.captain || "",
          ground: t.ground || ""
        };

      });

    }

    /* ---------- PLAYERS ---------- */

    if(Array.isArray(data.players) && data.players.length){

      HPL.players = data.players.map(p => {

        const team =
          p.team === "Chesara" ? "Chasers" : (p.team || "");

        return [
          p.name || "",
          p.short || p.name || "",
          team,
          p.place || "",
          p.role || "",
          p.batting || "",
          p.bowling || "",
          p.jersey || "",
          0,
          Number(p.matches || 0),
          Number(p.runs || 0),
          Number(p.fifties || 0),
          Number(p.hundreds || 0),
          Number(p.highest || 0),
          Number(p.notOuts || 0),
          Number(p.wickets || 0)
        ];

      });

      /*
        Existing UI expects:
        p[9]  = matches
        p[10] = runs
        p[11] = wickets
        p[12] = highest
        p[13] = 50s
        p[14] = 100s

        So convert the Firebase structure to exactly that order.
      */

      HPL.players = HPL.players.map(p => [
        p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],
        0,
        p[9],
        p[10],
        p[15],
        p[12],
        p[11],
        p[13]
      ]);

    }

    /* ---------- MATCHES ---------- */

    if(Array.isArray(data.matches) && data.matches.length){

      HPL.matches = data.matches.map(m => {

        const home =
          m.home === "Chesara" ? "Chasers" : (m.home || "");

        const away =
          m.away === "Chesara" ? "Chasers" : (m.away || "");

        const homeScore =
          `${Number(m.homeScore || 0)}/${Number(m.homeWickets || 0)}`;

        const awayScore =
          `${Number(m.awayScore || 0)}/${Number(m.awayWickets || 0)}`;

        return [
          Number(m.id) || m.id,
          home,
          away,
          homeScore,
          awayScore,
          m.result || "",
          m.ground || ""
        ];

      });

    }

    /* ---------- POINTS TABLE ---------- */

    if(Array.isArray(data.points) && data.points.length){

      HPL.points = data.points.map(p => {

        const team =
          p.team === "Chesara" ? "Chasers" : (p.team || "");

        return [
          team,
          Number(p.played || 0),
          Number(p.won || 0),
          Number(p.lost || 0),
          Number(p.points || 0)
        ];

      });

    }

    /* ---------- SCORECARDS ---------- */

    if(data.scorecards && typeof data.scorecards === "object"){

      const cards = {};

      Object.entries(data.scorecards).forEach(([id,value]) => {

        try{

          const parsed =
            typeof value === "string"
              ? JSON.parse(value)
              : value;

          if(parsed && parsed.h && parsed.a){

            cards[id] = {
              h: parsed.h,
              a: parsed.a
            };

          }

        }catch(error){

          console.warn("Scorecard could not be loaded:",id);

        }

      });

      /*
        Only replace scorecards when Firebase actually
        contains scorecards.
      */
      if(Object.keys(cards).length){
        HPL.scorecards = cards;
      }

    }

    /* ---------- NAME FIX ---------- */

    HPL.teams.forEach(t => {
      if(t.name === "Chesara") t.name = "Chasers";
    });

    HPL.players.forEach(p => {
      if(p[2] === "Chesara") p[2] = "Chasers";
    });

    HPL.matches.forEach(m => {
      if(m[1] === "Chesara") m[1] = "Chasers";
      if(m[2] === "Chesara") m[2] = "Chasers";
    });

    HPL.points.forEach(p => {
      if(p[0] === "Chesara") p[0] = "Chasers";
    });

    /* ---------- REFRESH WEBSITE ---------- */

    showPage('home');

    console.log("HPL Firebase data loaded successfully.");

  }catch(error){

    console.error("Firebase loading failed:",error);

    /*
      If Firebase fails, old hard-coded HPL data remains.
      Website will still work.
    */

    showPage('home');

  }

}

/* Start website */
showPage('home');

/* Then try Firebase */
loadFirebaseHPL();
