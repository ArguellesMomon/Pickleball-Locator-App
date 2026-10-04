# Pickle Batangas
Run locally: `npm install` then `npm run dev`
Deploy: push to GitHub, import the repo in Vercel (framework: Vite). Build: `npm run build`, output: `dist`.
Add courts by editing `src/data/courts.json` and putting photos in `public/images/`.

Fill in court details faster: `npm run checklist:export` creates `court-checklist.tsv` (open it in Excel or Google Sheets).
Fill in the blank columns (type, fee, rates, photo file name...), save it as Tab-delimited text (.tsv), then run `npm run checklist:import`.
Photos go in `public/images/`; write only the file name in the `photo` column.

Install as an app: on the live site, phones show "Add to Home Screen" (Share menu on iPhone) and Chrome/Edge show an install button.
Set `CONTACT_EMAIL` in `src/config.js` to show "Report a correction" links.

Several photos per court: in the checklist `photo` column, separate file names with `;` (for example `lipa-1.jpg;lipa-2.jpg`). The first one is the card photo.
