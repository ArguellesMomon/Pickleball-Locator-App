import fs from "node:fs";
import path from "node:path";

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default function handler(req, res) {
  const courts = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/courts.json"), "utf8"));
  const court = courts.find((c) => c.id === req.query.id); // undefined for the home page
  const origin = `https://${req.headers.host}`;

  const photo = court?.photos[0];
  const image = origin + (photo && !photo.endsWith(".svg") ? photo : "/og-default.png"); // previews need JPG/PNG, not SVG
  const title = court ? `${court.name} – Pickle Batangas` : "Pickle Batangas – Find pickleball courts in Batangas";
  const description = court
    ? `Pickleball court in ${court.municipality}. ${court.address}`
    : "Every pickleball court in Batangas, with hours, rates and contacts in one place.";
  const url = court ? `${origin}/courts/${court.id}` : origin;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Pickle Batangas">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(image)}"><meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary_large_image"></head><body><a href="${esc(url)}">${esc(title)}</a></body></html>`);
}
