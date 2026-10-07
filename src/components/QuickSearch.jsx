import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Clock3, X } from "lucide-react";
import courts from "../data/courts.json";
import useDialog from "../useDialog.js";
import { matchesCourt } from "../utils.js";
import OpenBadge from "./OpenBadge.jsx";
import { recentCourts } from "../useRecent.js";

const counts = {};
courts.forEach((c) => { counts[c.municipality] = (counts[c.municipality] || 0) + 1; });
const towns = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));

// Jump-to search: press / or Ctrl+K anywhere. Courts and towns, arrow keys + Enter.
export default function QuickSearch({ onClose }) {
  const navigate = useNavigate();
  const root = useRef(null);
  useDialog(root, onClose);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const recent = useMemo(recentCourts, []);

  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [...recent.slice(0, 4).map((c) => ({ type: "court", c, note: "Recently viewed" })), ...towns.slice(0, 5).map((t) => ({ type: "town", t }))];
    return [
      ...towns.filter((t) => t.toLowerCase().includes(s)).slice(0, 3).map((t) => ({ type: "town", t })),
      ...courts.filter((c) => matchesCourt(c, s)).slice(0, 7).map((c) => ({ type: "court", c })),
    ];
  }, [q, recent]);

  useEffect(() => { document.getElementById(`qs-option-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active]);

  const go = (it) => { onClose(); navigate(it.type === "court" ? `/courts/${it.c.id}` : `/courts?town=${encodeURIComponent(it.t)}`); };
  const onKey = (e) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.max(0, Math.min(a + 1, items.length - 1))); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && items[active]) go(items[active]);
  };

  return createPortal(
    <div className="qs-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="qs" ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Search courts">
        <div className="qs-field">
          <Search size={20} aria-hidden="true" />
          <input data-autofocus value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={onKey} placeholder="Search a court or town" aria-label="Search a court or town" role="combobox" aria-expanded="true" aria-controls="qs-list" aria-activedescendant={items[active] ? `qs-option-${active}` : undefined} />
          <button type="button" className="clear" aria-label="Close search" onClick={onClose}><X size={16} /></button>
        </div>
        <ul id="qs-list" role="listbox" className="qs-list">
          {!q && items.length > 0 && <li className="qs-label" aria-hidden="true">Jump to</li>}
          {items.map((it, i) => (
            <li key={it.type + (it.c?.id || it.t)} id={`qs-option-${i}`} role="option" aria-selected={i === active}>
              <button type="button" className={i === active ? "on" : ""} onMouseEnter={() => setActive(i)} onClick={() => go(it)}>
                {it.type === "court" ? <><Clock3 size={18} aria-hidden="true" /><span><b>{it.c.name}</b><small>{it.note || it.c.municipality}</small></span><OpenBadge court={it.c} /></>
                  : <><MapPin size={18} aria-hidden="true" /><span><b>{it.t}</b><small>{counts[it.t]} {counts[it.t] === 1 ? "court" : "courts"}</small></span></>}
              </button>
            </li>
          ))}
          {q && items.length === 0 && <li className="qs-empty">No courts or towns match "{q}".</li>}
        </ul>
        <p className="qs-hint"><kbd>↑</kbd><kbd>↓</kbd> to move · <kbd>Enter</kbd> to open · <kbd>Esc</kbd> to close</p>
      </div>
    </div>,
    document.body
  );
}
