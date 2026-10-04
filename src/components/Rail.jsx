import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Horizontal list: swipe on phones; arrows, mouse-drag and a clickable scrollbar on desktop
export default function Rail({ children, label = "List" }) {
  const ref = useRef(null), drag = useRef(null), suppressClick = useRef(false);
  const [s, setS] = useState({ thumb: 1, pos: 0, prev: false, next: false });

  const update = useCallback(() => {
    const el = ref.current; if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = { thumb: max > 0 ? el.clientWidth / el.scrollWidth : 1, pos: max > 0 ? el.scrollLeft / max : 0, prev: el.scrollLeft > 4, next: el.scrollLeft < max - 4 };
    setS((old) => (old.thumb === next.thumb && old.pos === next.pos && old.prev === next.prev && old.next === next.next ? old : next));
  }, []);
  useEffect(() => { update(); }); // the cards may have changed
  useEffect(() => {
    const el = ref.current;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { el.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [update]);

  const page = (dir) => ref.current.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  const jump = (e) => { const r = e.currentTarget.getBoundingClientRect(), el = ref.current; el.scrollTo({ left: ((e.clientX - r.left) / r.width) * (el.scrollWidth - el.clientWidth), behavior: "smooth" }); };

  // Mouse drag (touch already scrolls natively). A drag must not count as a click on a card.
  const down = (e) => { if (e.pointerType === "mouse") drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false }; };
  const move = (e) => {
    const d = drag.current; if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) { d.moved = true; ref.current.classList.add("grabbing"); ref.current.setPointerCapture(e.pointerId); }
    if (d.moved) ref.current.scrollLeft = d.left - dx;
  };
  const up = () => {
    const d = drag.current; drag.current = null;
    ref.current.classList.remove("grabbing");
    if (d?.moved) { suppressClick.current = true; setTimeout(() => { suppressClick.current = false; }, 0); }
  };

  return (
    <div className="rail-wrap">
      <button type="button" className="rail-btn prev" aria-label="Scroll left" disabled={!s.prev} onClick={() => page(-1)}><ChevronLeft size={22} /></button>
      <button type="button" className="rail-btn next" aria-label="Scroll right" disabled={!s.next} onClick={() => page(1)}><ChevronRight size={22} /></button>
      <div className="rail" ref={ref} role="region" aria-label={label} tabIndex={0}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onClickCapture={(e) => { if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); } }}>
        {children}
      </div>
      <div className={`rail-track ${s.thumb >= 1 ? "off" : ""}`} onClick={jump} aria-hidden="true">
        <span className="rail-thumb" style={{ width: `${s.thumb * 100}%`, left: `${s.pos * (1 - s.thumb) * 100}%` }} />
      </div>
    </div>
  );
}
