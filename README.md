# HPL Premium Season 11 — Admin + Live Control

This package contains the HPL public site and a Firebase-backed admin control center.

## Included
- HPL logo + Royal Kings, Titans, Stars and Chasers logos supplied for this build.
- Team Add / Edit / Delete + logo upload.
- Player Add / Edit / Delete + photo upload.
- Match Add / Edit / Delete + winner + winner photo.
- Scorecard JSON editor.
- Automatic player/points calculation hooks from scorecard data.
- Automatic Points Table with Runs For, Runs Against and NRR.
- Manual Points Table backup/override.
- Full JSON backup and restore for Firebase collections.
- Public site Firebase listeners for live updates.

## Firebase setup
1. Put your Firebase Web App config in `firebase-config.js`.
2. Enable Authentication (Email/Password), Firestore and Storage.
3. Create an admin user in Firebase Authentication.
4. Deploy these static files to your hosting.

No separate Publish button is used: Admin Save writes to Firebase and the public site listens with Firestore `onSnapshot`.

## Scorecard format
Use `scorecard.innings` entries like:
`{"team":"Royal Kings","runs":120,"balls":60,"batting":[{"player":"Sanjay","runs":65,"out":false}],"bowling":[{"player":"Likith","wickets":2}]}`

NRR uses runs / legal balls × 6. If an innings has `overs`, that value is used; otherwise `balls / 6` is used. Enter accurate innings balls/overs for correct NRR.
