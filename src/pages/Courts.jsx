import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Map as MapIcon, LayoutGrid, List, SearchX } from "lucide-react";
import courts from "../data/courts.json";
import CourtCard from "../components/CourtCard.jsx";
import FilterBar from "../components/FilterBar.jsx";
import PageHead from "../components/PageHead.jsx";
import BackButton from "../components/BackButton.jsx";
import SortSelect from "../components/SortSelect.jsx";
import useCourtFilters from "../useCourtFilters.js";
import useMedia from "../useMedia.js";

export default function Courts() {
  const filters = useCourtFilters();
  const { search } = useLocation();
  const roomy = useMedia("(min-width: 901px)"); // filters start open on big screens, collapsed on phones
  const count = filters.results.length;
  const filtered = filters.activeCount > 0 || filters.f.search;
  const towns = useMemo(() => {
    const n = {};
    courts.forEach((c) => { n[c.municipality] = (n[c.municipality] || 0) + 1; });
    return Object.entries(n).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, []);
  const town = filters.f.town;

  return (
    <>
      <PageHead back={<BackButton fallback={null} />} eyebrow="Directory" title="All courts">
        <div className="pagehead-row">
          <p className="muted">Filter, sort and save the courts you like.</p>
          <Link className="btn" to={`/map${search}`}><MapIcon size={18} aria-hidden="true" />View on map</Link>
        </div>
      </PageHead>
      <div className="page pull">
        <FilterBar filters={filters} defaultOpen={roomy} />
        <div className="townbar" role="group" aria-label="Quick town filter">
          <button type="button" className="chip" aria-pressed={town === "All"} onClick={() => filters.set("town", "All")}>All <b>{courts.length}</b></button>
          {towns.map(([t, n]) => (
            <button key={t} type="button" className="chip" aria-pressed={town === t} onClick={() => filters.set("town", town === t ? "All" : t)}>{t} <b>{n}</b></button>
          ))}
        </div>

        <div className="toolbar">
          <p className="muted"><b>{count}</b> {count === 1 ? "court" : "courts"}{filtered && <> · <button type="button" className="linkbtn" onClick={() => { filters.clearAll(); }}>Clear filters</button></>}</p>
          <div className="tools">
            <SortSelect filters={filters} />
            <div className="seg-toggle" role="group" aria-label="Layout">
              <button type="button" aria-pressed={filters.view === "grid"} aria-label="Grid view" onClick={() => filters.setView("grid")}><LayoutGrid size={18} /></button>
              <button type="button" aria-pressed={filters.view === "list"} aria-label="List view" onClick={() => filters.setView("list")}><List size={18} /></button>
            </div>
          </div>
        </div>

        {count === 0 ? (
          <div className="empty">
            <span className="empty-icon"><SearchX size={28} aria-hidden="true" /></span>
            <p>No courts match those filters.</p>
            <button type="button" className="btn" onClick={filters.clearAll}>Clear all filters</button>
          </div>
        ) : (
          <div className={`grid ${filters.view === "list" ? "list" : ""}`}>{filters.results.map(({ court, distance }) => <CourtCard key={court.id} court={court} distance={distance} />)}</div>
        )}
      </div>
    </>
  );
}
