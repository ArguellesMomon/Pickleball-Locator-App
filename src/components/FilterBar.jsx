import { useState, useId } from "react";
import { Search, Locate, Clock3, SlidersHorizontal, ChevronDown, X, Sunrise, Moon } from "lucide-react";
import courts from "../data/courts.json";
import { AMENITIES, to12h } from "../utils.js";
import { AMENITY_ICONS } from "../icons.jsx";

const towns = [...new Set(courts.map((c) => c.municipality))].sort();
// Only offer filters that at least one court has data for
const hasType = courts.some((c) => c.type);
const amenityChoices = AMENITIES.filter((a) => courts.some((c) => (c.amenities || []).includes(a)));

// Compact by default: just search + a Filters button. The rest slides open on demand.
export default function FilterBar({ filters, defaultOpen = false, className = "" }) {
  const panelId = useId();
  const { f, set, toggleAmenity, clearAll, findNearMe, geoError, activeCount } = filters;
  const [open, setOpen] = useState(defaultOpen);
  // While the panel is collapsed, show what's active as removable pills
  const pills = [
    f.town !== "All" && { label: f.town, remove: () => set("town", "All") },
    f.type !== "All" && { label: f.type, remove: () => set("type", "All") },
    f.openOnly && { label: "Open now", remove: () => set("openOnly", false) },
    f.at && { label: `Open at ${to12h(f.at)}`, remove: () => set("at", "") },
    ...f.amenities.map((a) => ({ label: a, remove: () => toggleAmenity(a) })),
  ].filter(Boolean);
  return (
    <div className={`filterbar ${open ? "open" : ""} ${className}`}>
      <div className="filter-top">
        <label className="field">
          <Search size={18} aria-hidden="true" />
          <input type="search" aria-label="Search courts by name, town, or address" placeholder="Search courts or towns" value={f.search} onChange={(e) => set("search", e.target.value)} />
          {f.search && <button type="button" className="clear" aria-label="Clear search" onClick={() => set("search", "")}><X size={16} /></button>}
        </label>
        <button type="button" className="btn ghost dark toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
          <SlidersHorizontal size={18} aria-hidden="true" /><span>Filters</span>
          {activeCount > 0 && <b className="count">{activeCount}</b>}
          <ChevronDown className="chev" size={16} aria-hidden="true" />
        </button>
      </div>
      {!open && pills.length > 0 && (
        <div className="active-row">
          {pills.map((x) => <button key={x.label} type="button" className="pill" aria-label={`Remove filter ${x.label}`} onClick={x.remove}>{x.label}<X size={12} aria-hidden="true" /></button>)}
        </div>
      )}
      <div className="filter-panel" id={panelId}>
        <div className="filter-inner">
          <div className={`filters ${hasType ? "typed" : ""}`}>
            <select value={f.town} onChange={(e) => set("town", e.target.value)} aria-label="City or town">
              <option value="All">All cities and towns</option>
              {towns.map((t) => <option key={t}>{t}</option>)}
            </select>
            {hasType && (
              <select value={f.type} onChange={(e) => set("type", e.target.value)} aria-label="Court type">
                <option value="All">Indoor and outdoor</option>
                <option>Indoor</option>
                <option>Outdoor</option>
              </select>
            )}
            <button type="button" className="btn" onClick={findNearMe}><Locate size={18} aria-hidden="true" />Near me</button>
          </div>
          <div className="chips">
            <button type="button" className="chip" aria-pressed={f.openOnly} onClick={() => set("openOnly", !f.openOnly)}><Clock3 size={14} aria-hidden="true" />Open now</button>
            {[["07:00", "Morning", Sunrise], ["18:00", "Evening", Moon]].map(([t, label, Icon]) => (
              <button key={t} type="button" className="chip" aria-pressed={f.at === t} onClick={() => set("at", f.at === t ? "" : t)}><Icon size={14} aria-hidden="true" />{label}</button>
            ))}
            <label className="timefield"><span>Open at</span><input type="time" value={f.at} onChange={(e) => set("at", e.target.value)} aria-label="Only courts open at this time" /></label>
            {amenityChoices.map((a) => {
              const Icon = AMENITY_ICONS[a];
              return (
                <button key={a} type="button" className="chip" aria-pressed={f.amenities.includes(a)} onClick={() => toggleAmenity(a)}>
                  {Icon && <Icon size={14} aria-hidden="true" />}{a}
                </button>
              );
            })}
            {activeCount > 0 && <button type="button" className="chip clear-all" onClick={clearAll}><X size={14} aria-hidden="true" />Clear all</button>}
          </div>
          {geoError && <p className="error">{geoError}</p>}
        </div>
      </div>
    </div>
  );
}
