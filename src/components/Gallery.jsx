import { useState, useRef } from "react";
import { Images } from "lucide-react";
import Img from "./Img.jsx";
import Lightbox from "./Lightbox.jsx";

// Desktop: one big photo + two tiles ("+N more"). Phones: swipeable carousel. Tapping any photo opens the full-screen viewer.
export default function Gallery({ photos, title, sample }) {
  const [open, setOpen] = useState(null); // index of the photo shown full screen
  const [pos, setPos] = useState(0);      // carousel position on phones
  const box = useRef(null);
  const n = photos.length;
  const onScroll = () => { const el = box.current; setPos(Math.round(el.scrollLeft / el.clientWidth)); };

  return (
    <>
      <div className="gallery-wrap">
      <div className="gallery" data-n={Math.min(n, 3)} ref={box} onScroll={onScroll}>
        {photos.map((p, i) => (
          <button key={p.src} type="button" className={`g-item g${i}`} aria-label={`View photo ${i + 1} of ${n} full screen`} onClick={() => setOpen(i)}>
            <Img src={p.src} alt={p.alt} />
            {i === 2 && n > 3 && <span className="g-more">+{n - 3} more</span>}
          </button>
        ))}
      </div>
      {/* controls sit outside the scrolling area so they stay put while the carousel moves */}
      <span className="g-count" aria-hidden="true">{pos + 1} / {n}</span>
      <button type="button" className="g-all" onClick={() => setOpen(0)}><Images size={16} aria-hidden="true" />Show all {n} photos</button>
      </div>
      {sample && <p className="g-note">Sample artwork. Real photos of this court are coming soon.</p>}
      {open !== null && <Lightbox photos={photos} index={open} title={title} onClose={() => setOpen(null)} />}
    </>
  );
}
