HPL SEASON 11 - FINAL PACK

Files:
- index.html / app.js / styles.css: public website
- admin.html / admin.js: Firebase admin panel
- assets/: HPL and team SVG logos

Firebase:
Project: hpl-cricket-league
Document: hpl/data

Important:
The public Points Table is calculated from all recorded matches, not from a hard-coded played count.
For the current 7 matches:
Titans: P3 W2 L1 RF507 RA393 Diff+114 Pts4
Chasers: P3 W2 L1 RF687 RA616 Diff+71 Pts4
Royal Kings: P4 W2 L2 RF733 RA842 Diff-109 Pts4
Stars: P4 W1 L3 RF570 RA646 Diff-76 Pts2

Run Difference is shown instead of NRR because HPL is hand cricket and the current match data does not provide a standard overs-based NRR denominator.

After replacing the files in GitHub, open admin.html for login. Saving in the admin panel updates Firestore, and the public site listens with onSnapshot for live changes.
