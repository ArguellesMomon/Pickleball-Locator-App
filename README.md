# Pickle Batangas

A responsive pickleball court finder for Batangas, built with React, Vite, and Leaflet.

## Run locally

```sh
npm install
npm run dev
```

Build for production with `npm run build`, and inspect the build with `npm run preview`.
Run the discovery, comparison, and planning regression checks with `npm test`.

## Pages and features

- **Discover** (`/`): court suggestions, open-now/nearby/saved tabs, town discovery, and recently viewed courts.
- **Court directory** (`/courts`): shareable URL filters, search across names/towns/addresses/amenities, sorting, and grid/list views.
- **Court details** (`/courts/:id`): opening-hours timeline, gallery, contacts, weather, directions, and nearby courts.
- **Map** (`/map`): synchronized filters and pins, desktop results panel, and a mobile sheet that supports touch and keyboard resizing.
- **Saved courts** (`/saved`): persistent favorites, shared shortlists, and undoable removal. Favorites synchronize between browser tabs.
- **Compare** (`/compare`): compare up to three venues using the comparison button on court cards.
- **Plan a game** (`/plan`): a saved draft, valid future game times, complete opening-window checks, shareable invite text, and calendar export.
- **About** (`/about`): project information and a form for preparing court suggestions or corrections.

The old `/explore` link redirects to Discover. Press **/** or **Ctrl/Cmd+K** to open quick search.

## Appearance and accessibility

Light and dark mode follow the device preference on first visit. The header toggle saves the chosen theme.
Structural styles live in `src/styles.css`; colors, component styling, and responsive layouts live in `src/design.css`.
Motion respects the visitor’s reduced-motion preference. Modals lock background scrolling, contain keyboard focus, and restore focus after closing.

## Court data and artwork

Edit `src/data/courts.json` to add courts. Put real venue photos in `public/images/`.
Unknown hours, court types, rates, and amenities are shown honestly as not listed.
The default galleries and card artwork are original illustrations, clearly labeled; they do not depict the actual venues.

`npm run checklist:export` creates `court-checklist.tsv` for Excel or Google Sheets.
Fill in the details, save as tab-delimited text, and run `npm run checklist:import`.
Separate multiple photo filenames with `;`. The first real photo is used on the court card.

Set `CONTACT_EMAIL` and/or `FACEBOOK_URL` in `src/config.js` to enable a contact destination for suggestions.
Without those settings, the form prepares a copyable message; it does not submit a listing.
Invitations do not reserve courts or take payment.

## Deployment and offline behavior

Deploy through Vercel using framework **Vite**, build command `npm run build`, and output directory `dist`.
The existing Vercel configuration handles direct page URLs and social previews.

The production service worker caches the app shell, route bundles, and default court artwork.
Vite produces `asset-manifest.json` for precaching. Maps, live weather, external fonts, and outbound services need an internet connection.
The site can be installed through the browser’s “Install app” or “Add to Home Screen” option.
