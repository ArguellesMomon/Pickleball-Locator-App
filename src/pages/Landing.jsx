import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Search, MapPin, Locate, Clock3, CalendarDays, Heart, Navigation, Plus, Compass } from "lucide-react";
import courts from "../data/courts.json";
import CourtCard from "../components/CourtCard.jsx";
import CourtVisual from "../components/CourtVisual.jsx";
import useNow from "../useNow.js";
import useSaved from "../useSaved.js";
import useGeo, { locate } from "../useGeo.js";
import { distanceKm, isOpenNow } from "../utils.js";
import { recentCourts } from "../useRecent.js";
const QUICK = [["Open now", "open=1", Clock3], ["Evening play", "at=18%3A00", CalendarDays], ["Covered courts", "amen=Covered", MapPin], ["Paddle rental", "amen=Paddle%20rental", Compass]];
export default function Landing() {
  useNow();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("discover");
  const {
    ids
  } = useSaved();
  const geo = useGeo();
  const towns = useMemo(() => {
    const n = {};
    courts.forEach(c => n[c.municipality] = (n[c.municipality] || 0) + 1);
    return Object.entries(n).sort((a, b) => b[1] - a[1]);
  }, []);
  const open = courts.filter(isOpenNow);
  const recent = useMemo(recentCourts, []);
  const featured = useMemo(() => [...courts].sort((a, b) => (b.amenities?.length || 0) + (b.phone ? 1 : 0) - ((a.amenities?.length || 0) + (a.phone ? 1 : 0))).slice(0, 6), []);
  const list = tab === "open" ? open.slice(0, 6) : tab === "saved" ? courts.filter(c => ids.includes(c.id)).slice(0, 6) : tab === "near" && geo.pos ? courts.map(c => ({
    ...c,
    distance: distanceKm(geo.pos.lat, geo.pos.lng, c.lat, c.lng)
  })).sort((a, b) => a.distance - b.distance).slice(0, 6) : featured;
  const pickTab = id => {
    setTab(id);
    if (id === "near" && !geo.pos) locate();
  };
  return <>
    <section className="discovery-hero">
      <div className="discovery-hero-in">
        <div className="hero-copy">
          <p className="hero-kicker"><span />LOCAL COURTS. GOOD GAMES.</p>
          <h1>Your next game<br />starts <em>here.</em><svg className="heading-swoosh" viewBox="0 0 180 14" aria-hidden="true"><path d="M3 10Q90 -5 177 7" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></svg></h1>
          <p className="hero-intro">A little less searching. A lot more playing.<br className="desktop-break" /> Discover your kind of pickleball court in Batangas.</p>
          <form className="discovery-search" onSubmit={e => {
            e.preventDefault();
            navigate("/courts" + (query.trim() ? "?q=" + encodeURIComponent(query.trim()) : ""));
          }}>
            <Search size={20} /><input aria-label="Search courts or towns" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Court name or town" /><button className="btn primary" type="submit">Find a court<ArrowRight size={17} /></button>
          </form>
          <div className="hero-links"><button className="linkbtn" onClick={() => {
              locate();
              navigate("/courts?sort=near");
            }}><Locate size={15} />Use my location</button><span /><Link to="/map"><MapPin size={15} />Explore the map<ArrowUpRight size={14} /></Link></div>
          <div className="hero-social"><div className="mini-balls" aria-hidden="true"><span>🏓</span><span>↗</span><span>✳</span></div><p><b>More places to play.</b><br />{courts.length} listed venues across {towns.length} towns.</p></div>
        </div>
        <div className="hero-scene">
          <div className="scene-top"><span><MapPin size={14} />BATANGAS, PHILIPPINES</span><span>14° N · 121° E</span></div>
          <CourtVisual hero />
          <div className="scene-stamp">GET OUT.<br />GET PLAYING.<span>✳</span></div>
          <Link to="/courts?open=1" className="scene-float"><span className="live-dot" /><div><b>{open.length} courts open now</b><small>Your next rally is waiting</small></div><ArrowUpRight size={18} /></Link>
          <span className="scene-caption">A little court-side inspiration · original illustration</span>
        </div>
      </div>
    </section>
    <div className="discovery-strip"><div><span>FIND YOUR COURT</span>{QUICK.map(([label, q, Icon]) => <Link to={"/courts?" + q} key={label}><Icon size={16} />{label}<ArrowUpRight size={14} /></Link>)}</div></div>
    <section className="section discovery-section" id="discover">
      <div className="section-head"><div><p className="eyebrow">THE COURT EDIT</p><h2>Find your new favorite.</h2><p className="muted">A local spot for every kind of player.</p></div><Link to="/courts" className="see-all">Browse all courts<ArrowRight size={17} /></Link></div>
      <div className="discovery-tabs" aria-label="Court suggestions">
        {[["discover", "Discover"], ["open", "Open now"], ["near", "Near me"], ["saved", "My saved courts"]].map(([id, label]) => <button type="button" className={tab === id ? "selected" : ""} aria-pressed={tab === id} key={id} onClick={() => pickTab(id)}>{id === "saved" && <Heart size={15} />} {label}</button>)}
        <span className="tab-note"><span className="live-dot" />Hours in Philippine time</span>
      </div>
      {tab === "near" && !geo.pos ? <div className="empty"><Locate size={28} /><h3>Find your neighborhood court.</h3><p>Use your location, or choose a town when location is unavailable.</p><button className="btn primary" onClick={() => locate()}>{geo.status === "asking" ? "Finding your location…" : "Find courts near me"}</button></div> : list.length ? <div className="grid home-courts">{list.map(c => <CourtCard key={c.id} court={c} distance={c.distance} />)}</div> : <div className="empty"><Heart size={28} /><h3>{tab === "saved" ? "Keep your favorites close." : "The next game can wait a little."}</h3><p>{tab === "saved" ? "Tap the heart on a court to build your own shortlist." : "No court with listed hours is open right now. Browse the directory to plan ahead."}</p><Link className="btn primary" to="/courts">Browse courts<ArrowRight size={16} /></Link></div>}
    </section>
    <section className="section town-section">
      <div className="section-head"><div><p className="eyebrow">A LITTLE CLOSER TO HOME</p><h2>Where do you want to play?</h2></div><Link to="/map" className="see-all">See the province<ArrowUpRight size={17} /></Link></div>
      <div className="destination-grid">{towns.slice(0, 6).map(([town, count], i) => <Link to={"/courts?town=" + encodeURIComponent(town)} key={town} className={"destination destination-" + i}><span className="destination-number">0{i + 1}</span><Compass className="destination-art" size={92} strokeWidth={.7} /><div><h3>{town}</h3><p>{count} {count === 1 ? "court" : "courts"} to discover</p></div><ArrowUpRight size={20} /></Link>)}</div>
    </section>
    {recent.length > 0 && <section className="section"><div className="section-head"><div><p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2>Recently viewed</h2></div></div><div className="grid home-courts">{recent.slice(0, 3).map(c => <CourtCard key={c.id} court={c} />)}</div></section>}
    <section className="section"><div className="game-banner"><div><p className="eyebrow light">LESS GROUP CHAT. MORE GAME TIME.</p><h2>Make “we should play”<br />an actual plan.</h2><p>Pick a court, set a time, and share an invite.<br />Your next doubles game, sorted.</p><Link className="btn" to="/plan">Plan a game<ArrowRight size={18} /></Link></div><div className="game-ticket"><div className="ticket-top"><CalendarDays size={22} /><span>YOUR NEXT GAME</span><span>✳</span></div><h3>Good friends.<br />Great rallies.</h3><div className="ticket-row"><MapPin size={16} />Your favorite Batangas court</div><div className="ticket-row"><Clock3 size={16} />A time that works for everyone</div><div className="ticket-bottom"><span>ADMIT YOUR WHOLE CREW</span><span>|||| ||| || ||||</span></div></div></div></section>
    <section className="section how-section"><div className="section-head"><div><p className="eyebrow">FROM DISCOVERY TO FIRST SERVE</p><h2>Three steps. One good game.</h2></div></div><div className="how-grid">{[[Search, "01", "Find your spot", "Search by town, hours, or the amenities that matter to you."], [Navigation, "02", "Check the details", "Explore opening hours and contacts, then get directions."], [CalendarDays, "03", "Bring your people", "Save your favorites and turn a group chat into a game plan."]].map(([Icon, n, title, body]) => <div key={n}><div className="how-top"><Icon size={22} /><span>{n}</span></div><h3>{title}</h3><p>{body}</p></div>)}</div></section>
    <section className="section contribute-section"><div><Plus size={21} /><span><b>Good courts deserve to be found.</b> Know a spot we’re missing?</span></div><Link to="/about#contact">Suggest a court<ArrowUpRight size={16} /></Link></section>
  </>;
}
