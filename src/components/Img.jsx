import { useState } from "react";

// Shimmer placeholder until the photo has loaded, then a soft fade-in
export default function Img({ src, alt, className = "" }) {
  const [ready, setReady] = useState(false);
  return (
    <div className={`media ${ready ? "done" : ""} ${className}`}>
      <img src={src} alt={alt} loading="lazy" className={ready ? "loaded" : ""} onLoad={() => setReady(true)}
        ref={(el) => { if (el?.complete && el.naturalWidth) setReady(true); }} />
    </div>
  );
}
