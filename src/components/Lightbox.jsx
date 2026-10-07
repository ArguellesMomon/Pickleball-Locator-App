import { useState, useRef, useEffect } from "react";
import useDialog from "../useDialog.js";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Full-screen photo viewer: swipe or arrow keys, tap a photo to zoom, Esc or tap outside to close
export default function Lightbox({ photos, index, title, onClose }) {
  const n = photos.length;
  const [i, setI] = useState(index);
  const [dx, setDx] = useState(0);
  const [zoom, setZoom] = useState(null); // { x, y } (percent) while a photo is zoomed in
  const root = useRef(null), closeBtn = useRef(null), startX = useRef(null), moved = useRef(false);
  const go = (d) => { setZoom(null); setI((c) => (c + d + n) % n); };

  useDialog(root, onClose);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const down = (e) => { if (!zoom) { startX.current = e.clientX; moved.current = false; } };
  const move = (e) => { if (startX.current == null) return; const d = e.clientX - startX.current; if (Math.abs(d) > 6) moved.current = true; setDx(d); };
  const up = () => { if (startX.current == null) return; const d = dx; startX.current = null; setDx(0); if (d < -60) go(1); else if (d > 60) go(-1); };
  const tapImage = (e) => {
    if (moved.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom(zoom ? null : { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return createPortal(
    <div className="lb" ref={root} role="dialog" aria-modal="true" aria-label={`${title} photos`}>
      <div className="lb-top">
        <span className="lb-count">{i + 1} / {n}</span>
        <span className="lb-title">{title}</span>
        <button ref={closeBtn} type="button" className="lb-btn" aria-label="Close photos" onClick={onClose}><X size={22} /></button>
      </div>
      <div className="lb-stage" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}
        onClick={(e) => { if (!e.target.closest("img") && !moved.current) onClose(); }}>
        <div className={`lb-track ${startX.current != null ? "drag" : ""}`} style={{ transform: `translateX(calc(${-i * 100}% + ${dx}px))` }}>
          {photos.map((p, idx) => (
            <div className="lb-slide" key={p.src}>
              <img src={p.src} alt={p.alt} draggable="false" onClick={tapImage}
                style={zoom && idx === i ? { transform: "scale(2.2)", transformOrigin: `${zoom.x}% ${zoom.y}%`, cursor: "zoom-out" } : undefined} />
            </div>
          ))}
        </div>
      </div>
      {n > 1 && <>
        <button type="button" className="lb-nav prev" aria-label="Previous photo" onClick={() => go(-1)}><ChevronLeft size={28} /></button>
        <button type="button" className="lb-nav next" aria-label="Next photo" onClick={() => go(1)}><ChevronRight size={28} /></button>
      </>}
      <div className="lb-bottom">
        <p className="lb-cap">{photos[i].alt}</p>
        {n > 1 && <div className="lb-thumbs">{photos.map((p, idx) => (
          <button key={p.src} type="button" className={idx === i ? "on" : ""} aria-label={`Show photo ${idx + 1}`} onClick={() => { setZoom(null); setI(idx); }}><img src={p.src} alt="" /></button>
        ))}</div>}
      </div>
    </div>,
    document.body
  );
}
