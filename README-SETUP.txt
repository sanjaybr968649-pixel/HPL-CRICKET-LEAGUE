HPL SEASON 11 - LIVE ADMIN + PUBLIC WEBSITE

LIVE FLOW
Admin Panel SAVE DATA -> Firebase Firestore (hpl/data) -> Public HPL Website updates automatically.
The public website uses a real-time Firestore listener, so a refresh is normally NOT needed.

FILES
- index.html / app.js / styles.css = public website
- admin.html / admin.js / admin.css = admin panel
- assets/ = HPL/team logos
- firestore.rules = Firestore rules for public read + authenticated admin write

IMPORTANT FIRESTORE RULES
The public website must be allowed to READ hpl/data. The admin must be authenticated to WRITE.
If your current Firebase rules do not allow public reads, open Firebase Console -> Firestore Database -> Rules and use the contents of firestore.rules.

DO NOT put any Firebase service-account/private key in this website. The included Firebase web config is intended for the client SDK; Firestore Security Rules protect writes.

HOW TO USE
1. Upload/replace these files in your GitHub Pages repository.
2. Open /admin.html and log in with your Firebase Authentication email/password.
3. Add or edit data, then press SAVE DATA.
4. Keep the public HPL website open in another tab. It will receive the Firestore update automatically.

If Firebase is temporarily unavailable, the public website still shows the built-in Season 11 fallback data instead of a blank/black page.


TEAM NAME + LOGO + LIVE UPDATE
- Open Admin Panel -> Teams.
- Click CHANGE beside an existing team.
- Change Team name, Captain, Ground and optionally choose a logo image.
- Click UPDATE SELECTED TEAM, then click SAVE DATA.
- Team name changes are also applied to player team fields, match home/away fields and points table.
- Logo is stored with the team data, so it remains visible even after changing the team name.
- Public website listens to Firestore in real time, so saved changes appear automatically.

IMPORTANT FINAL DATA SYNC FIX
- The Admin Panel now loads the existing Firestore data AND restores/merges the Season 11 data already present on the public website when Firestore is missing players, matches, points, scorecards, or teams.
- Chasers is the official team name; old "Chesara" values are converted to "Chasers".
- Team logos use the bundled SVG fallback logos when no custom logo is stored.
- On the first successful Admin login/load after installing this version, the merged Season 11 data is written back to Firestore so the Admin Panel and public site use the same dataset.
- Public app listens to Firestore in real time. Saving in Admin updates the public site automatically.
