# HPL Season 11 — Final Website Package

## Included
- Public HPL Season 11 website and Admin Panel
- Firebase web configuration and security rules
- Correct team labels: Royal Kings, Titans, Chasers, Stars
- Player profiles/squad list and known HPL career batting figures from the supplied project data
- Separate IPL career-run field; only verified values are prefilled, and unknown values remain blank rather than being invented
- Match list starts empty intentionally: enter each match, scorecard and winning/result photo in Admin
- Result poster library images are included but are not automatically attached to a match

## Setup
1. Upload all ZIP contents to the root of your GitHub Pages repository.
2. In Firebase Authentication enable Email/Password and create your admin user.
3. Enable Firestore Database and Firebase Storage.
4. Publish `firestore.rules` and `storage.rules`.
5. Open `admin.html`, sign in, and add matches with the appropriate winning photo.

## Important
This package has not been deployed to your GitHub repository. Browser-level Firebase integration and production security rules must be checked in your own Firebase project. The IPL career values included are: Shubman Gill 4598, Ajinkya Rahane 5247, MS Dhoni 5047, Shreyas Iyer 4229, Jacob Bethell 163, and Vaibhav Sooryavanshi 1028. These are shown separately from HPL runs. Other players' IPL career totals are left unfilled rather than guessed.
