import { useState } from "react";
export default function Img({
  src,
  alt,
  className = ""
}) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  return <div className={"media " + (ready ? "done " : "") + className}><img src={failed ? "/images/placeholder.svg" : src} alt={failed ? "Court illustration; venue photo unavailable" : alt} loading="lazy" className={ready ? "loaded" : ""} onLoad={() => setReady(true)} onError={() => {
      if (!failed) {
        setFailed(true);
        setReady(false);
      }
    }} ref={el => {
      if (el?.complete && el.naturalWidth && !ready) setReady(true);
    }} /></div>;
}
