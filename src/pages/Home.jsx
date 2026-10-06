import { useState, useMemo, useEffect, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Locate, Map as MapIcon, Clock3, ArrowUpRight, Shuffle } from "lucide-react";
import courts from "../data/courts.json";
import CourtCard from "../components/CourtCard.jsx";
import CourtArt from "../components/CourtArt.jsx";
import { WeatherChip } from "../components/WeatherCard.jsx";
import { recentCourts } from "../useRecent.js";
import Rail from "../components/Rail.jsx";
import ProvinceMap from "../components/ProvinceMap.jsx";
import useCountUp from "../useCountUp.js";
import useSaved from "../useSaved.js";
import { isOpenNow, distanceKm } from "../utils.js";
import useGeo, { locate, openGeoHelp } from "../useGeo.js";
import { AMENITY_ICONS } from "../icons.jsx";
import { CONTACT_EMAIL } from "../config.js";

const HEADLINE = ["Find", "your", "next", "game", "in"];
const HINTS = ["Search a court or town", "Try “Lipa”", "Try “Tanauan”", "Try “Nasugbu”", "Try “Pickle”"];
const QUICK = [["Open now", "/courts?open=1", Clock3], ["Lights", "/courts?amen=Lights", AMENITY_ICONS.Lights], ["Parking", "/courts?amen=Parking", AMENITY_ICONS.Parking], ["Restrooms", "/courts?amen=Restrooms", AMENITY_ICONS.Restrooms]];

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", hour: "2-digit", hourCycle: "h23" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

// Tabbed horizontal list: what's open, what's closest, what you saved
function Discover({ openNow }) {
  const { ids } = useSaved();
  const { pos, status, source, label } = useGeo();
  const [tab, setTab] = useState("open");
  const saved = courts.filter((c) => ids.includes(c.id));
  const nearest = useMemo(() => (pos ? courts.map((c) => ({ court: c, distance: distanceKm(pos.lat, pos.lng, c.lat, c.lng) })).sort((a, b) => a.distance - b.distance).slice(0, 10) : []), [pos]);

  function pick(next) { setTab(next); if (next === "near" && !pos) locate(); } // called from a tap, so phones show the permission prompt

  const tabs = [["open", `Open now (${openNow.length})`], ["near", "Near me"], ...(saved.length ? [["saved", `Saved (${saved.length})`]] : [])];
  const seeAll = { open: "/courts?open=1", near: "/courts?sort=near", saved: "/saved" }[tab];

  return (
    <section className="section reveal">
      <div className="section-head">
        <div><p className="eyebrow">Ready to play</p><h2>Courts for you</h2></div>
        <Link className="see-all" to={seeAll}>See all<ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
      <div className="tabs" role="tablist">
        {tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className="tab" onClick={() => pick(id)}>{label}</button>)}
      </div>
      {tab === "open" && (openNow.length ? <Rail key="open" label="Courts open now">{openNow.slice(0, 12).map((c) => <CourtCard key={c.id} court={c} />)}</Rail>
        : <p className="muted">No court with listed hours is open right now. Check back soon.</p>)}
      {tab === "near" && (pos ? <>
          <p className="muted loc-note"><Locate size={14} aria-hidden="true" /> {source === "gps" ? "Based on your current location" : `Based on ${label}`}</p>
          <Rail key="near" label="Nearest courts">{nearest.map(({ court, distance }) => <CourtCard key={court.id} court={court} distance={distance} />)}</Rail>
        </>
        : status === "asking" ? <p className="muted">Finding courts near you…</p>
        : <div className="hint">
            <p>Share your location to see the closest courts, or pick your town instead.</p>
            <div className="row tight"><button type="button" className="btn" onClick={() => locate()}><Locate size={18} aria-hidden="true" />Use my location</button><button type="button" className="btn ghost dark" onClick={openGeoHelp}>Pick my town</button></div>
          </div>)}
      {tab === "saved" && <Rail key="saved" label="Saved courts">{saved.map((c) => <CourtCard key={c.id} court={c} />)}</Rail>}
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [hint, setHint] = useState(0);
  const townCount = useMemo(() => new Set(courts.map((c) => c.municipality)).size, []);
  const openNow = useMemo(() => courts.filter((c) => isOpenNow(c)), []);
  const recent = useMemo(recentCourts, []);
  const nCourts = useCountUp(courts.length), nTowns = useCountUp(townCount), nOpen = useCountUp(openNow.length);

  useEffect(() => { const t = setInterval(() => setHint((h) => (h + 1) % HINTS.length), 2800); return () => clearInterval(t); }, []);

  const search = (e) => { e.preventDefault(); navigate(`/courts?q=${encodeURIComponent(query.trim())}`); };
  const surprise = () => { const pool = openNow.length ? openNow : courts; navigate(`/courts/${pool[Math.floor(Math.random() * pool.length)].id}`); };

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <p className="eyebrow light">{greeting()} · ready for a game?</p>
            <h1>
              {HEADLINE.map((w, i) => <Fragment key={w}><span className="w" style={{ "--w": i }}>{w}</span>{" "}</Fragment>)}
              <span className="w" style={{ "--w": 5 }}><em>Batangas.</em></span>
            </h1>
            <p className="lede">Every court in the province, with hours, directions and contacts in one place.</p>
            <form className="searchbar hero-search" onSubmit={search}>
              <Search size={20} aria-hidden="true" />
              <input type="search" placeholder={HINTS[hint]} aria-label="Search courts or towns" value={query} onChange={(e) => setQuery(e.target.value)} />
              <button className="btn" type="submit">Search</button>
            </form>
            <div className="qchips" aria-label="Quick filters">
              {QUICK.map(([label, to, Icon]) => <Link key={label} to={to} className="qchip"><Icon size={14} aria-hidden="true" />{label}</Link>)}
            </div>
            <WeatherChip />
            <div className="row">
              <button type="button" className="btn ghost" onClick={() => { locate(); navigate("/courts?sort=near"); }}><Locate size={18} aria-hidden="true" />Courts near me</button>
              <Link className="btn ghost" to="/map"><MapIcon size={18} aria-hidden="true" />Open the map</Link>
            </div>
            <dl className="stats">
              <div><dt>Courts</dt><dd>{nCourts}</dd></div>
              <div><dt>Cities and towns</dt><dd>{nTowns}</dd></div>
              <div><dt>Open now</dt><dd>{nOpen}</dd></div>
            </dl>
          </div>
          <CourtArt />
        </div>
      </section>

      {recent.length > 0 && (
        <section className="section reveal">
          <div className="section-head"><div><p className="eyebrow">Pick up where you left off</p><h2>Recently viewed</h2></div></div>
          <Rail label="Recently viewed courts">{recent.map((c) => <CourtCard key={c.id} court={c} />)}</Rail>
        </section>
      )}

      <Discover openNow={openNow} />

      <section className="section reveal">
        <div className="section-head">
          <div><p className="eyebrow">Explore the province</p><h2>Where do you want to play?</h2></div>
          <button type="button" className="btn ghost dark" onClick={surprise}><Shuffle size={18} aria-hidden="true" />Surprise me</button>
        </div>
        <ProvinceMap />
      </section>

      <section className="section reveal">
        <div className="band">
          <h2>Know a court we missed?</h2>
          <p>Local courts open all the time. Help players find the next one.</p>
          {CONTACT_EMAIL
            ? <a className="btn" href={`mailto:${CONTACT_EMAIL}?subject=Add%20a%20court`}>Suggest a court</a>
            : <Link className="btn" to="/about#contact">Suggest a court</Link>}
        </div>
      </section>
    </>
  );
}
