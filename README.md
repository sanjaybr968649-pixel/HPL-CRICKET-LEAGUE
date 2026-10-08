# HPL Season 11 — rebuilt website package

## Main features
- Simple opening screen with HPL logo, loading indicator reaching 100%, “WELCOME TO HPL”, and a “TAP TO OPEN” button. No complex opening animation.
- Four team cards. Tapping a team opens the full squad; tapping a player opens that player's profile.
- All 32 roster entries included from the existing project data and squad mappings.
- HPL Career, Season 11, and IPL career runs displayed separately. Unknown IPL totals are left blank rather than fabricated.
- Match centre and points table; add match data through the admin panel.
- Firebase listener attempts are guarded so local team/squad data remains visible if Firebase is unavailable.

## Publish
Upload the contents of this folder to the root of the GitHub Pages repository, preserving `assets/` paths and filename case. Do not upload the ZIP itself as the website.

## Important honest limitation
This ZIP was checked for file presence, JSON validity, JavaScript syntax, and asset references. A live browser/Firebase deployment test was not performed. Firebase Auth/Firestore/Storage setup and security rules must be verified in the Firebase project before the admin can save shared data. Match history is intentionally empty so old scores are not invented or duplicated.
