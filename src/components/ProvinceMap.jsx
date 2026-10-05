import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Map as MapIcon } from "lucide-react";
import courts from "../data/courts.json";
import OpenBadge from "./OpenBadge.jsx";
import { isOpenNow } from "../utils.js";

const W = 1000, H = 640, PAD = 70;
const avg = (list, key) => list.reduce((sum, c) => sum + c[key], 0) / list.length;

// Each town becomes a bubble placed by its real position, sized by how many courts it has
function layoutTowns() {
  const groups = {};
  courts.forEach((c) => (groups[c.municipality] ||= []).push(c));
  const towns = Object.entries(groups).map(([name, list]) => ({ name, list, lat: avg(list, "lat"), lng: avg(list, "lng") }));
  const k = Math.cos((13.95 * Math.PI) / 180); // longitude shrinks a little this far north
  const xs = towns.map((t) => t.lng * k), ys = towns.map((t) => -t.lat); // north at the top
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = Math.min((W - 2 * PAD) / (x1 - x0), (H - 2 * PAD) / (y1 - y0));
  towns.forEach((t, i) => {
    t.x = PAD + (W - 2 * PAD - (x1 - x0) * scale) / 2 + (xs[i] - x0) * scale;
    t.y = PAD + (H - 2 * PAD - (y1 - y0) * scale) / 2 + (ys[i] - y0) * scale;
    t.r = 20 + Math.min(t.list.length, 8) * 3;
  });
  const keepInside = (t) => { t.x = Math.min(W - t.r - 20, Math.max(t.r + 20, t.x)); t.y = Math.min(H - t.r - 36, Math.max(t.r + 16, t.y)); }; // bottom margin = room for the name
  for (let n = 0; n < 300; n++) { // nudge bubbles apart, leaving room for each town's name, so every one can be tapped
    for (let i = 0; i < towns.length; i++) for (let j = i + 1; j < towns.length; j++) {
      const a = towns[i], b = towns[j];
      let dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1, min = a.r + b.r + (Math.abs(dx) < a.r + b.r ? 40 : 18); // extra room above/below, where the name sits
      if (d < min) { const push = (min - d) / 2; dx /= d; dy /= d; a.x -= dx * push; a.y -= dy * push; b.x += dx * push; b.y += dy * push; }
    }
    towns.forEach(keepInside);
  }
  return towns.sort((a, b) => b.list.length - a.list.length || a.name.localeCompare(b.name));
}

export default function ProvinceMap() {
  const towns = useMemo(layoutTowns, []);
  const [name, setName] = useState(towns[0].name);
  const sel = towns.find((t) => t.name === name);
  const openCount = (t) => t.list.filter((c) => isOpenNow(c)).length;
  const q = encodeURIComponent(sel.name);

  return (
    <div className="pm">
      <div className="pm-map">
        <span className="pm-compass" aria-hidden="true">N ↑</span>
        {towns.map((t, i) => {
          const live = openCount(t) > 0;
          return (
            <button key={t.name} type="button" aria-pressed={t.name === name}
              aria-label={`${t.name}: ${t.list.length} ${t.list.length === 1 ? "court" : "courts"}, ${openCount(t)} open now`}
              className={`bubble ${live ? "live" : ""} ${t.name === name ? "sel" : ""} ${t.list.length >= 5 ? "big" : ""}`}
              style={{ left: `${(t.x / W) * 100}%`, top: `${(t.y / H) * 100}%`, width: `${((t.r * 2) / W) * 100}%`, "--d": `${(i % 7) * 0.7}s` }}
              onClick={() => setName(t.name)} onMouseEnter={() => setName(t.name)} onFocus={() => setName(t.name)}>
              <b>{t.list.length}</b><span className="bname">{t.name}</span>
            </button>
          );
        })}
        <p className="pm-legend"><i className="lg live" />Open court right now<i className="lg" />Closed or no hours</p>
      </div>

      <aside className="pm-panel" key={sel.name} aria-live="polite">
        <p className="eyebrow">Selected town</p>
        <h3>{sel.name}</h3>
        <p className="pm-stats"><span><b>{sel.list.length}</b> {sel.list.length === 1 ? "court" : "courts"}</span><span><b>{openCount(sel)}</b> open now</span></p>
        <ul className="pm-list">
          {sel.list.slice(0, 4).map((c) => (
            <li key={c.id}><Link to={`/courts/${c.id}`}><span className="pm-name">{c.name}</span><OpenBadge court={c} /><ArrowUpRight size={16} aria-hidden="true" /></Link></li>
          ))}
        </ul>
        {sel.list.length > 4 && <p className="muted">+ {sel.list.length - 4} more</p>}
        <div className="row">
          <Link className="btn primary" to={`/courts?town=${q}`}>See all in {sel.name}</Link>
          <Link className="btn ghost dark" to={`/map?town=${q}`}><MapIcon size={18} aria-hidden="true" />On map</Link>
        </div>
      </aside>

      {/* Same choices as the bubbles, easier to reach with a thumb */}
      <div className="townpick" role="group" aria-label="Choose a town">
        {towns.map((t) => <button key={t.name} type="button" className="chip" aria-pressed={t.name === name} onClick={() => setName(t.name)}>{t.name} <b>{t.list.length}</b></button>)}
      </div>
    </div>
  );
}
