import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { CalendarDays, MapPin, Navigation, Car, Phone, Share2, Check, Globe, Clock3, Layers, Banknote, Building2, Flag, Copy, Info, ExternalLink } from "lucide-react";
import courts from "../data/courts.json";
import OpenBadge from "../components/OpenBadge.jsx";
import SaveButton from "../components/SaveButton.jsx";
import BackButton from "../components/BackButton.jsx";
import CourtCard from "../components/CourtCard.jsx";
import Gallery from "../components/Gallery.jsx";
import Ambient from "../components/Ambient.jsx";
import Rail from "../components/Rail.jsx";
import WeatherCard from "../components/WeatherCard.jsx";
import { recordView } from "../useRecent.js";
import { normalIcon } from "../mapIcons.js";
import { AMENITY_ICONS, FacebookIcon } from "../icons.jsx";
import { formatHours, openStatus, distanceKm, shareCourt, courtPhotos, describeCourt } from "../utils.js";
import { CONTACT_EMAIL } from "../config.js";

// Live open/closed card with a 24-hour bar: yellow = open hours, dark marker = right now
function StatusCard({ court }) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 60000); return () => clearInterval(t); }, []);
  const s = openStatus(court);
  if (!s) {
    return <div className="status-card unknown"><Clock3 size={20} aria-hidden="true" /><div><strong>Hours not listed</strong><p className="muted">Call or check their page before you go.</p></div></div>;
  }
  return (
    <div className={`status-card ${s.open ? "is-open" : "is-closed"}`}>
      <div className="status-top"><span className="dot" /><strong>{s.open ? "Open now" : "Closed right now"}</strong><span className="status-text">{s.text}</span></div>
      <div className="daybar" role="img" aria-label={`Open ${formatHours(court)}`}>
        {s.segments.map(([a, b], i) => <i key={i} className="seg" style={{ left: `${a * 100}%`, width: `${(b - a) * 100}%` }} />)}
        <i className="now" style={{ left: `${s.pct * 100}%` }} />
      </div>
      <div className="daylabels" aria-hidden="true"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span></div>
    </div>
  );
}

export default function CourtDetail() {
  const { id } = useParams();
  const [shared, setShared] = useState(false);
  const [addrCopied, setAddrCopied] = useState(false);
  const court = courts.find((c) => c.id === id);
  useEffect(() => { recordView(id); }, [id]); // feeds "Recently viewed" and quick search

  if (!court) {
    return <div className="page"><h1>Court not found</h1><Link className="btn" to="/courts">Back to courts</Link></div>;
  }

  const googleMaps = `https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`;
  const waze = `https://waze.com/ul?ll=${court.lat},${court.lng}&navigate=yes`;
  const { photos, sample } = courtPhotos(court);
  const facts = [[Clock3, formatHours(court)], [Layers, court.courtCount && `${court.courtCount} courts`], [Building2, court.type], [Banknote, court.rates]].filter((f) => f[1]);
  const nearby = courts.filter((c) => c.id !== court.id)
    .map((c) => ({ court: c, distance: distanceKm(court.lat, court.lng, c.lat, c.lng) }))
    .sort((a, b) => a.distance - b.distance).slice(0, 4);
  const doShare = async () => setShared((await shareCourt(court)) === "copied");

  return (
    <div className="detail-wrap">
      <Ambient />
      <div className="page detail">
        <BackButton />

        <header className="d-head">
          <div className="d-title">
            <p className="tags"><OpenBadge court={court} />{court.type && <span className="tag">{court.type}</span>}{court.fee && <span className="tag">{court.fee}</span>}</p>
            <h1>{court.name}</h1>
            <p className="addr"><MapPin size={16} aria-hidden="true" />{court.address}</p>
          </div>
          <div className="d-tools">
            <SaveButton court={court} className="big" />
            <button type="button" className="save big" aria-label={shared ? "Link copied" : "Share this court"} onClick={doShare}>{shared ? <Check size={20} /> : <Share2 size={20} />}</button>
          </div>
        </header>
        <div className="qfacts">{facts.map(([Icon, text]) => <span className="qf" key={text}><Icon size={16} aria-hidden="true" />{text}</span>)}</div>

        <Gallery photos={photos} title={court.name} sample={sample} />

        <div className="d-grid">
          <aside className="plan panel">
            <h2 className="panel-title">Plan your visit</h2>
            <StatusCard court={court} />
            {court.type !== "Indoor" && <WeatherCard court={court} />}
            <div className="plan-actions">
              <a className="btn primary" href={googleMaps} target="_blank" rel="noreferrer"><Navigation size={18} aria-hidden="true" />Get directions</a>
              <Link className="btn ghost dark" to={`/plan?c=${court.id}`}><CalendarDays size={18} aria-hidden="true" />Plan a game here</Link>
              <a className="btn ghost dark" href={waze} target="_blank" rel="noreferrer"><Car size={18} aria-hidden="true" />Open in Waze</a>
            </div>
            {(court.phone || court.facebook || court.website) && (
              <ul className="contact-rows">
                {court.phone && <li><a href={`tel:${court.phone.replace(/\s/g, "")}`}><Phone size={18} aria-hidden="true" />{court.phone}</a></li>}
                {court.facebook && <li><a href={court.facebook} target="_blank" rel="noreferrer"><FacebookIcon size={18} />Facebook page</a></li>}
                {court.website && <li><a href={court.website} target="_blank" rel="noreferrer"><Globe size={18} aria-hidden="true" />Website</a></li>}
              </ul>
            )}
          </aside>

          <div className="d-main">
            <section className="panel reveal">
              <h2 className="panel-title">About this court</h2>
              <p className="lede-dark">{court.description || describeCourt(court)}</p>
              <p className="note"><Info size={18} aria-hidden="true" />Details come from public listings and can change. Please call ahead to confirm hours, rates and reservations.</p>
            </section>

            <section className="panel reveal">
              <h2 className="panel-title">Amenities</h2>
              {(court.amenities || []).length > 0 ? (
                <div className="amen-grid">
                  {court.amenities.map((a) => { const Icon = AMENITY_ICONS[a]; return <div className="amen-tile" key={a}><span>{Icon && <Icon size={18} aria-hidden="true" />}</span>{a}</div>; })}
                </div>
              ) : <p className="muted">No amenities listed yet. Ask the court what's available.</p>}
            </section>

            <section className="panel reveal">
              <div className="loc-top">
                <div><h2 className="panel-title">Location</h2><p className="muted">{court.address}</p></div>
                <button type="button" className="btn ghost dark" onClick={async () => { await navigator.clipboard.writeText(court.address); setAddrCopied(true); }}>
                  {addrCopied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}{addrCopied ? "Copied" : "Copy address"}
                </button>
              </div>
              <div className="map-card">
                <MapContainer center={[court.lat, court.lng]} zoom={15} className="minimap" zoomControl={false} dragging={false} touchZoom={false} scrollWheelZoom={false} doubleClickZoom={false}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[court.lat, court.lng]} icon={normalIcon} />
                </MapContainer>
                <a className="map-link" href={googleMaps} target="_blank" rel="noreferrer">Open in Google Maps<ExternalLink size={14} aria-hidden="true" /></a>
              </div>
            </section>

            <p className="muted report"><Flag size={14} aria-hidden="true" /> {CONTACT_EMAIL
              ? <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Correction: " + court.name)}`}>Report a correction</a>
              : <Link to="/about#contact">Report a correction</Link>}</p>
          </div>
        </div>

        <section className="nearby reveal">
          <div className="section-head"><div><p className="eyebrow">Keep playing</p><h2>Courts nearby</h2></div></div>
          <Rail label="Courts nearby">{nearby.map(({ court: c, distance }) => <CourtCard key={c.id} court={c} distance={distance} />)}</Rail>
        </section>
      </div>

      {/* Phones and tablets: the main actions stay one tap away */}
      <div className="cta-bar">
        <a className="btn primary" href={googleMaps} target="_blank" rel="noreferrer"><Navigation size={18} aria-hidden="true" />Directions</a>
        {court.phone
          ? <a className="btn ghost dark" href={`tel:${court.phone.replace(/\s/g, "")}`}><Phone size={18} aria-hidden="true" />Call</a>
          : <a className="btn ghost dark" href={waze} target="_blank" rel="noreferrer"><Car size={18} aria-hidden="true" />Waze</a>}
      </div>
    </div>
  );
}
