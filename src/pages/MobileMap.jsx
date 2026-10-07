import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Locate, Maximize2, Navigation, Phone, Heart, Share2, Check, X, ArrowUpRight } from "lucide-react";
import courts from "../data/courts.json";
import CourtMap from "../components/CourtMap.jsx";
import CourtCard from "../components/CourtCard.jsx";
import FilterBar from "../components/FilterBar.jsx";
import OpenBadge from "../components/OpenBadge.jsx";
import MapLegend from "../components/MapLegend.jsx";
import Img from "../components/Img.jsx";
import useSaved from "../useSaved.js";
import { formatHours, shareCourt, courtPhotos } from "../utils.js";
import { stopTracking } from "../useGeo.js";

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

function SaveChip({ court }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(court.id);
  return <button type="button" className="btn ghost dark" aria-pressed={saved} onClick={() => toggle(court.id)}><Heart size={18} fill={saved ? "currentColor" : "none"} aria-hidden="true" />{saved ? "Saved" : "Save"}</button>;
}
function ShareChip({ court }) {
  const [copied, setCopied] = useState(false);
  return <button type="button" className="btn ghost dark" onClick={async () => setCopied((await shareCourt(court)) === "copied")}>{copied ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}{copied ? "Copied" : "Share"}</button>;
}

// Full-screen map, floating search, draggable bottom sheet (like Google Maps on a phone)
export default function MobileMap({ filters }) {
  const { results, selectedId, select, me, trackMe } = filters;
  const flown = useRef(false); // fly to you once per tap, then just move the blue dot
  const root = useRef(null), sheetRef = useRef(null), drag = useRef(null);
  const [H, setH] = useState(640);
  const [bar, setBar] = useState(80);         // where the floating search bar ends (px from the top of the map)
  const [sheetBottom, setSheetBottom] = useState(8); // gap under the sheet (room for the phone dock)
  const [snap, setSnap] = useState(selectedId ? "half" : "peek"); // "peek" | "half" | "full"
  const [dragVis, setDragVis] = useState(null);
  const [focus, setFocus] = useState(null);
  const [fitTick, setFitTick] = useState(0);
  const selected = results.find(r => r.court.id === selectedId)?.court;
  useEffect(() => { if (selectedId && !selected) select(null); }, [selectedId, selected]);

  // "full" stops 10px under the search bar, so the bar and the sheet's handle never overlap
  const full = Math.max(H - sheetBottom - bar - 10, 140);
  const SNAP = { peek: 112, half: Math.min(Math.round(H * 0.52), full), full }; // visible sheet height in px
  const vis = dragVis ?? SNAP[snap];

  useEffect(() => {
    const measure = () => {
      const el = root.current; if (!el) return;
      setH(el.clientHeight || 640);
      const top = el.querySelector(".map-top");
      if (top) setBar(top.getBoundingClientRect().bottom - el.getBoundingClientRect().top + 8); // +8 = the bar's own padding
      if (sheetRef.current) setSheetBottom(parseFloat(getComputedStyle(sheetRef.current).bottom) || 0);
    };
    measure();
    const later = setTimeout(measure, 400); // again once fonts have loaded
    const observer = new ResizeObserver(measure);
    if (root.current) observer.observe(root.current);
    const top = root.current?.querySelector(".map-top");
    if (top) observer.observe(top);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); clearTimeout(later); window.removeEventListener("resize", measure); };
  }, []);
  useEffect(() => { if (me && !flown.current) { flown.current = true; setFocus({ lat: me.lat, lng: me.lng, zoom: 14 }); } }, [me]);
  useEffect(() => () => stopTracking(), []); // stop using the GPS when leaving the map

  function choose(court) {
    select(court.id);
    setSnap("half");
    setFocus({ lat: court.lat, lng: court.lng, zoom: 15, offsetY: SNAP.half / 2 });
  }
  function clearSelection() { select(null); setSnap("peek"); }

  // Drag the handle to resize the sheet; a plain tap cycles through the three sizes
  const onDown = (e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { y: e.clientY, start: SNAP[snap], moved: false }; };
  const onMove = (e) => {
    const d = drag.current; if (!d) return;
    if (Math.abs(d.y - e.clientY) > 4) d.moved = true;
    setDragVis(clamp(d.start + d.y - e.clientY, SNAP.peek, SNAP.full));
  };
  const onUp = () => {
    const d = drag.current; drag.current = null;
    if (!d) return;
    if (!d.moved) setSnap(snap === "peek" ? "half" : snap === "half" ? "full" : "peek");
    else setSnap(Object.entries(SNAP).sort((a, b) => Math.abs(a[1] - vis) - Math.abs(b[1] - vis))[0][0]);
    setDragVis(null);
  };

  const n = results.length;
  return (
    <div className="mmap" ref={root} data-snap={snap} style={{ "--vis": `${vis}px` }}>
      <CourtMap results={results} activeId={selectedId} onSelect={choose} onBackgroundClick={selected ? clearSelection : undefined} focus={focus} me={me} zoomControl={false} fitTick={fitTick} fitPadding={{ top: bar + 30, bottom: vis + 40 }} />

      <div className="map-top"><FilterBar filters={filters} className="floating" /></div>
      <MapLegend />
      <button type="button" className="fab fit" aria-label="Fit all courts on screen" onClick={() => setFitTick((t) => t + 1)}><Maximize2 size={20} aria-hidden="true" /></button>
      <button type="button" className="fab" aria-label="Show my location" onClick={() => { flown.current = false; trackMe(); }}><Locate size={22} aria-hidden="true" /></button>

      <section ref={sheetRef} className={`sheet ${dragVis !== null ? "dragging" : ""}`} aria-label={selected ? selected.name : "Courts"}>
        <button type="button" className="sheet-handle" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-label="Resize court list" onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSnap(s => s === "peek" ? "half" : s === "half" ? "full" : "peek"); } }}><span className="grabber" /></button>
        <div className="sheet-body">
          {selected ? (
            <>
              <div className="sel-head">
                <div>
                  <h2>{selected.name}</h2>
                  <p className="muted">{[selected.municipality, selected.type, selected.fee].filter(Boolean).join(" · ")}</p>
                  <p className="tags"><OpenBadge court={selected} /><span className="muted">{formatHours(selected)}</span></p>
                </div>
                <button type="button" className="close" aria-label="Close" onClick={clearSelection}><X size={18} /></button>
              </div>
              <div className="actionrow">
                <a className="btn primary" href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer"><Navigation size={18} aria-hidden="true" />Directions</a>
                {selected.phone && <a className="btn ghost dark" href={`tel:${selected.phone.replace(/\s/g, "")}`}><Phone size={18} aria-hidden="true" />Call</a>}
                <SaveChip court={selected} /><ShareChip court={selected} />
              </div>
              <Link className="btn block" to={`/courts/${selected.id}`}>See full details<ArrowUpRight size={18} aria-hidden="true" /></Link>
              <div className="strip">{courtPhotos(selected).photos.map((photo) => <Img key={photo.src} src={photo.src} alt={photo.alt} />)}</div>
            </>
          ) : (
            <>
              <h2>{n} {n === 1 ? "court" : "courts"}</h2>
              <p className="muted">{n ? "Tap a pin, or expand the list" : "No courts match these filters."}</p>
              {!n && <button className="btn ghost dark" onClick={filters.clearAll}>Clear filters</button>}
              <div className="grid">{results.map(({ court, distance }) => <CourtCard key={court.id} court={court} distance={distance} />)}</div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
