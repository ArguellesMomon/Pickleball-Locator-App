import { useEffect, useState } from "react";

// true while the screen matches a CSS media query, e.g. useMedia("(max-width: 900px)")
export default function useMedia(query) {
  const read = () => !!window.matchMedia?.(query).matches;
  const [matches, setMatches] = useState(read);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const update = () => setMatches(mq.matches);
    mq.addEventListener("change", update);
    update();
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}
