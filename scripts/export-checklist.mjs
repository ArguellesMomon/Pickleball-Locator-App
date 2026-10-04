// Creates court-checklist.tsv: one row per court, with links to open and blank columns to fill in.
// Run:  npm run checklist:export   (open the file in Excel or Google Sheets)
import fs from "node:fs";

const courts = JSON.parse(fs.readFileSync("src/data/courts.json", "utf8"));
const columns = ["id", "name", "municipality", "googleMaps", "facebook", "website", "phone", "open", "close",
  "type", "fee", "courtCount", "rates", "amenities", "photo", "description"];

const clean = (value) => String(value ?? "").replace(/[\t\r\n]+/g, " ");
const rows = courts.map((c) => ({
  ...c,
  googleMaps: `https://www.google.com/maps/place/?q=place_id:${c.placeId}`,
  amenities: (c.amenities || []).join(";"),
  photo: (c.photos || []).filter((p) => !p.includes("placeholder")).map((p) => p.replace("/images/", "")).join(";"), // several photos: a.jpg;b.jpg
}));

const lines = [columns.join("\t"), ...rows.map((r) => columns.map((k) => clean(r[k])).join("\t"))];
fs.writeFileSync("court-checklist.tsv", lines.join("\n"));
console.log(`Wrote court-checklist.tsv with ${rows.length} courts`);
