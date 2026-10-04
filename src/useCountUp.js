import { useEffect, useState } from "react";

// Counts from 0 to `target` (skipped when the visitor prefers reduced motion)
export default function useCountUp(target, ms = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || !window.requestAnimationFrame;
    if (calm) { setN(target); return; }
    let frame, start;
    const tick = (t) => {
      start ??= t;
      const p = Math.min((t - start) / ms, 1);
      setN(Math.round(target * (1 - (1 - p) ** 3))); // ease-out
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);
  return n;
}
