HPL Season 11 - Safe Firebase Admin Panel

This version keeps Firebase and adds a safety guard:
- SAVE DATA will NOT overwrite Firebase when the panel has no data.
- Saves use Firestore merge:true.
- ADD/UPDATE/DELETE actions continue to auto-save.
- Firebase config and Firestore path remain the same: hpl/data.

Install:
Replace the existing admin.html, admin.css and admin.js in your GitHub Pages repo with these three files.
Then refresh admin.html and login.
