import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock3, MapPin, Locate, Heart, CalendarDays, CloudSun, ArrowRight, Download, Smartphone, Share, Monitor, Building2, Check } from "lucide-react";
import courts from "../data/courts.json";
import Ambient from "../components/Ambient.jsx";
import ProvinceMap from "../components/ProvinceMap.jsx";
import OpenBadge from "../components/OpenBadge.jsx";
import useCountUp from "../useCountUp.js";
import useInstall from "../useInstall.js";
import { isOpenNow } from "../utils.js";
import { CONTACT_EMAIL } from "../config.js";

const FEATURES = [
  [Clock3, "Live open status", "See what is open right now, with a 24-hour timeline on every court."],
  [MapPin, "A map that tells the truth", "Yellow pins are open, grey are closed. Filter the list and the map follows."],
  [Locate, "Near me, one tap", "Sort by distance and get turn-by-turn directions in Google Maps or Waze."],
  [CalendarDays, "Plan a game", "Pick a court and a time, then send the invite to your group chat."],
  [CloudSun, "Check the weather", "Temperature and rain chance by the hour, before you head out."],
  [Heart, "Save and share", "Keep your favorites and send your whole list to a friend."],
];
const STEPS = [["1", "Find", "Search a court or town, or tap Near me."], ["2", "Check", "Hours, rates, photos and weather in one place."], ["3", "Play", "Directions, a call, or an invite to your group."]];

// A little phone built from real data, so visitors see the app before they open it
function PhoneMock({ list }) {
  return (
    <div className="phone" aria-hidden="true">
      <div className="phone-screen">
        <div className="ph-top"><span className="ph-search">Search a court or town</span></div>
        <div className="ph-map">{[[22, 30], [58, 22], [70, 58], [34, 64], [48, 44], [80, 34]].map(([x, y], i) => <i key={i} className={i % 3 === 0 ? "live" : ""} style={{ left: `${x}%`, top: `${y}%`, "--d": `${i * 0.35}s` }} />)}</div>
        <div className="ph-sheet">
          <b>{courts.length} courts</b>
          {list.map((c) => <div className="ph-row" key={c.id}><span className="ph-thumb" /><span><strong>{c.name}</strong><small>{c.municipality}</small></span><OpenBadge court={c} /></div>)}
        </div>
      </div>
    </div>
  );
}

function Install() {
  const { canInstall, installed, install } = useInstall();
  return (
    <section className="section reveal" id="install">
      <div className="section-head"><div><p className="eyebrow">Take it with you</p><h2>Install it like an app</h2></div></div>
      <p className="muted">No app store. It opens full screen, loads fast and keeps working when your signal drops.</p>
      <div className="install">
        <div className="install-card"><h3><Smartphone size={20} aria-hidden="true" />Android</h3>
          {installed ? <p><Check size={16} aria-hidden="true" /> You're already using the app.</p>
            : canInstall ? <button type="button" className="btn primary" onClick={install}><Download size={18} aria-hidden="true" />Install app</button>
            : <p>Open the browser menu and tap <b>Install app</b> or <b>Add to Home screen</b>.</p>}</div>
        <div className="install-card"><h3><Share size={20} aria-hidden="true" />iPhone</h3><p>Tap the <b>Share</b> button in Safari, then <b>Add to Home Screen</b>.</p></div>
        <div className="install-card"><h3><Monitor size={20} aria-hidden="true" />Computer</h3><p>In Chrome or Edge, click the <b>install icon</b> at the end of the address bar.</p></div>
      </div>
    </section>
  );
}

export default function Landing() {
  const towns = useMemo(() => [...new Set(courts.map((c) => c.municipality))], []);
  const open = useMemo(() => courts.filter((c) => isOpenNow(c)).length, []);
  const withHours = useMemo(() => courts.filter((c) => c.open).slice(0, 2), []);
  const nCourts = useCountUp(courts.length), nTowns = useCountUp(towns.length), nOpen = useCountUp(open);
  const { canInstall, install } = useInstall();
  const sample = withHours[0] || courts[0];

  return (
    <>
      <section className="lp-hero">
        <Ambient />
        <div className="lp-hero-in">
          <div>
            <p className="eyebrow light">The pickleball court finder for Batangas</p>
            <h1><span className="w" style={{ "--w": 0 }}>Find a court.</span>{" "}<span className="w" style={{ "--w": 2 }}><em>Play tonight.</em></span></h1>
            <p className="lede">Every court in the province on one map, with live hours, directions, weather and an invite you can send to your group.</p>
            <div className="lp-cta">
              <Link className="btn big" to="/explore">Find a court<ArrowRight size={20} aria-hidden="true" /></Link>
              <Link className="btn ghost big" to="/map"><MapPin size={20} aria-hidden="true" />See the map</Link>
              {canInstall && <button type="button" className="btn ghost big" onClick={install}><Download size={20} aria-hidden="true" />Install app</button>}
            </div>
            <dl className="stats"><div><dt>Courts</dt><dd>{nCourts}</dd></div><div><dt>Cities and towns</dt><dd>{nTowns}</dd></div><div><dt>Open now</dt><dd>{nOpen}</dd></div></dl>
          </div>
          <PhoneMock list={withHours} />
        </div>
      </section>

      <div className="marquee" aria-hidden="true"><div className="marquee-track">{[...towns, ...towns].map((t, i) => <span key={i}>{t}</span>)}</div></div>

      <section className="section reveal">
        <div className="section-head"><div><p className="eyebrow">Everything you need</p><h2>Made for the way you actually play</h2></div></div>
        <div className="features">
          {FEATURES.map(([Icon, title, text]) => <div className="feature" key={title}><span className="step-icon"><Icon size={22} aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></div>)}
        </div>
      </section>

      <section className="section reveal">
        <div className="steps">{STEPS.map(([n, title, text]) => <div className="step" key={title}><span className="step-n">{n}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
      </section>

      <section className="section reveal">
        <div className="section-head"><div><p className="eyebrow">Across the province</p><h2>Courts in every corner of Batangas</h2></div></div>
        <ProvinceMap />
      </section>

      <section className="section reveal">
        <div className="lp-plan">
          <div>
            <p className="eyebrow">Plan a game</p><h2>From "who's free?" to "see you there"</h2>
            <p className="muted">Choose a court, a time and how many players you need. We check the court's hours, write the invite, and add it to your calendar.</p>
            <Link className="btn primary" to={`/plan?c=${sample.id}`}><CalendarDays size={18} aria-hidden="true" />Plan a game</Link>
          </div>
          <div className="invite" aria-hidden="true"><p className="eyebrow light">Invite preview</p><pre>{`🏓 Pickleball at ${sample.name}\n📅 Saturday, 5:00 PM to 7:00 PM\n📍 ${sample.address}\n👥 Looking for 4 players`}</pre></div>
        </div>
      </section>

      <Install />

      <section className="section reveal">
        <div className="band">
          <h2><Building2 size={28} aria-hidden="true" /> Run a court? Get listed for free.</h2>
          <p>Add your hours, rates and photos so players can find you. We'll check the details with you first.</p>
          <Link className="btn" to="/about#contact">List your court</Link>
        </div>
      </section>

      <section className="section reveal">
        <div className="band final">
          <h2>Ready to play?</h2>
          <p>Open the app and find a court near you.</p>
          <Link className="btn big" to="/explore">Find a court<ArrowRight size={20} aria-hidden="true" /></Link>
        </div>
      </section>
    </>
  );
}
