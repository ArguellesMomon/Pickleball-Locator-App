import { useState, useEffect } from "react";
import { Locate, Maximize2 } from "lucide-react";
import CourtMap from "../components/CourtMap.jsx";
import CourtCard from "../components/CourtCard.jsx";
import FilterBar from "../components/FilterBar.jsx";
import MobileMap from "./MobileMap.jsx";
import SortSelect from "../components/SortSelect.jsx";
import MapLegend from "../components/MapLegend.jsx";
import useCourtFilters from "../useCourtFilters.js";
import useMedia from "../useMedia.js";

// Phones and small tablets get the Google-Maps-style layout; larger screens get list + map side by side.
export default function MapPage() {
  const filters = useCourtFilters();
  const compact = useMedia("(max-width: 900px)");
  return compact ? <MobileMap filters={filters} /> : <DesktopMap filters={filters} />;
}

function DesktopMap({ filters }) {
  const [hoveredId, setHoveredId] = useState(null); // hovering a card highlights its pin
  const [fitTick, setFitTick] = useState(0);
  const [focus, setFocus] = useState(null);
  useEffect(() => { if (filters.me) setFocus({ lat: filters.me.lat, lng: filters.me.lng, zoom: 13 }); }, [filters.me]);
  const n = filters.results.length;
  return (
    <div className="split">
      <aside className="side">
        <h1>Find a court</h1>
        <FilterBar filters={filters} />
        <div className="side-sort"><SortSelect filters={filters} /></div>
        <p className="muted count-line">{n} {n === 1 ? "court" : "courts"} on the map</p>
        <div className="grid">
          {filters.results.map(({ court, distance }) => <CourtCard key={court.id} court={court} distance={distance} onHover={setHoveredId} />)}
        </div>
      </aside>
      <div className="mapwrap">
        <CourtMap results={filters.results} activeId={hoveredId} popups me={filters.me} fitTick={fitTick} focus={focus} />
        <div className="map-ctrls">
          <button type="button" aria-label="Show courts near me" title="Near me" onClick={filters.findNearMe}><Locate size={20} /></button>
          <button type="button" aria-label="Fit all courts on screen" title="Fit all courts" onClick={() => setFitTick((t) => t + 1)}><Maximize2 size={20} /></button>
        </div>
        <MapLegend />
      </div>
    </div>
  );
}
