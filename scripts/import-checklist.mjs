// Reads your edited court-checklist.tsv and updates src/data/courts.json.
// Only filled-in cells are used, so blank cells never erase existing data.
// Run:  npm run checklist:import
import fs from "node:fs";

const AMENITIES = ["Lights", "Parking", "Restrooms", "Paddle rental", "Covered"];
const TIME = /^([01]?\d|2[0-4]):[0-5]\d$/; // 24-hour time, e.g. 06:00 or 22:30 (24:00 = midnight)
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const courts = JSON.parse(fs.readFileSync("src/data/courts.json", "utf8"));
const [header, ...lines] = fs.readFileSync("court-checklist.tsv", "utf8").split(/\r?\n/).filter(Boolean);
const columns = header.split("\t");
let updated = 0;

for (const line of lines) {
  const cells = line.split("\t").map((v) => v.trim());
  const row = Object.fromEntries(columns.map((name, i) => [name, cells[i] || ""]));
  const court = courts.find((c) => c.id === row.id);
  if (!court) { console.warn(`Skipped unknown id: ${row.id}`); continue; }

  for (const key of ["facebook", "website", "phone", "rates", "description"]) if (row[key]) court[key] = row[key];
  for (const key of ["open", "close"]) {
    if (!row[key]) continue;
    if (TIME.test(row[key])) court[key] = row[key].padStart(5, "0");
    else console.warn(`${court.name}: "${row[key]}" is not a time like 06:00, skipped`);
  }
  if (["indoor", "outdoor"].includes(row.type.toLowerCase())) court.type = capitalize(row.type);
  else if (row.type) console.warn(`${court.name}: type must be Indoor or Outdoor`);
  if (["free", "paid"].includes(row.fee.toLowerCase())) court.fee = capitalize(row.fee);
  else if (row.fee) console.warn(`${court.name}: fee must be Free or Paid`);
  if (row.courtCount) court.courtCount = Number(row.courtCount);
  if (row.amenities) court.amenities = row.amenities.split(";").map((a) => a.trim()).filter((a) => AMENITIES.includes(a));
  if (row.photo) court.photos = row.photo.split(";").map((f) => f.trim()).filter(Boolean).map((f) => `/images/${f}`); // files must be inside public/images/
  updated++;
}

fs.writeFileSync("src/data/courts.json", JSON.stringify(courts, null, 1) + "\n");
console.log(`Checked ${updated} rows and saved src/data/courts.json`);
