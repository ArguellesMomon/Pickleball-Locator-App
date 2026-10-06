import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Locate, X, MapPin } from "lucide-react";
import useGeo, { locate, chooseTown, closeGeoHelp, townCenters } from "../useGeo.js";

const towns = townCenters();

// Shown when location is blocked or unavailable: says exactly how to fix it, or lets you pick a town instead
export default function GeoDialog() {
  const { dialog, status } = useGeo();
  const box = useRef(null);
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e) => { if (e.key === "Escape") closeGeoHelp(); };
    document.addEventListener("keydown", onKey);
    box.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog]);
  if (!dialog) return null;

  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua), android = /Android/.test(ua), inApp = /FBAN|FBAV|Instagram|Messenger|Line\/|MicroMessenger|TikTok/.test(ua);
  const title = status === "unsupported" ? "This browser can't share your location" : status === "error" ? "We couldn't find your location" : "Location is turned off for this site";
  const steps = ios ? [
    <>Open <b>Settings → Privacy &amp; Security → Location Services</b> and make sure it is <b>On</b>.</>,
    <>Scroll to <b>Safari Websites</b> and choose <b>While Using the App</b>.</>,
    <>Or in Safari tap <b>aA</b> in the address bar → <b>Website Settings → Location → Allow</b>.</>,
  ] : android ? [
    <>Tap the <b>lock icon</b> next to the address, then <b>Permissions → Location → Allow</b>.</>,
    <>Make sure <b>Location</b> is switched on in your phone's quick settings.</>,
  ] : [<>Click the <b>lock icon</b> in the address bar, then <b>Site settings → Location → Allow</b>.</>];

  return createPortal(
    <div className="geo-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeGeoHelp(); }}>
      <div className="geo" role="dialog" aria-modal="true" aria-labelledby="geo-title" tabIndex={-1} ref={box}>
        <button type="button" className="clear geo-x" aria-label="Close" onClick={closeGeoHelp}><X size={16} /></button>
        <span className="geo-icon"><Locate size={26} aria-hidden="true" /></span>
        <h2 id="geo-title">{title}</h2>
        {inApp && <p className="note"><b>Tip:</b> you opened this inside another app (Messenger, Facebook or Instagram), which often blocks location. Tap the menu and choose <b>Open in Safari</b> or <b>Open in Chrome</b>.</p>}
        {status !== "unsupported" && <ol className="geo-steps">{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>}
        <button type="button" className="btn primary" onClick={() => locate()}><Locate size={18} aria-hidden="true" />Try again</button>
        <p className="geo-or"><MapPin size={16} aria-hidden="true" /> Or pick your town and we'll show the courts closest to it</p>
        <div className="geo-towns">{towns.map((t) => <button key={t.name} type="button" className="chip" onClick={() => chooseTown(t.name)}>{t.name}</button>)}</div>
      </div>
    </div>,
    document.body
  );
}
