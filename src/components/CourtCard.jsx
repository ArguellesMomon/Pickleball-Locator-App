import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight, Clock3, GitCompareArrows } from "lucide-react";
import OpenBadge from "./OpenBadge.jsx";
import SaveButton from "./SaveButton.jsx";
import Img from "./Img.jsx";
import CourtVisual from "./CourtVisual.jsx";
import useCompare from "../useCompare.js";
import { formatHours } from "../utils.js";
export default function CourtCard({
  court,
  distance,
  onHover
}) {
  const real = court.photos?.find(p => !p.includes("placeholder"));
  const variant = [...court.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 4;
  const {
    ids,
    toggle
  } = useCompare();
  return <article className="card-wrap">
    <Link to={"/courts/" + court.id} className="card" onMouseEnter={() => onHover?.(court.id)} onMouseLeave={() => onHover?.(null)}>
      {real ? <Img src={real} alt={court.name} /> : <div className="media illustrated"><CourtVisual variant={variant} /><span className="art-label">Court illustration</span></div>}
      <div className="card-body">
        <div className="card-location"><MapPin size={13} />{court.municipality}{distance != null && <span> · {distance.toFixed(1)} km</span>}</div>
        <div className="card-top"><h3>{court.name}</h3><ArrowUpRight className="go" size={19} /></div>
        <p className="meta2"><Clock3 size={14} />{formatHours(court)}</p>
        <div className="card-bottom"><OpenBadge court={court} /><span>{court.courtCount ? court.courtCount + " courts" : court.amenities?.[0] || "View details"}</span></div>
      </div>
    </Link>
    <SaveButton court={court} />
    <button className="compare-btn" type="button" aria-label={"Compare " + court.name} aria-pressed={ids.includes(court.id)} onClick={() => toggle(court.id)} title="Add to comparison"><GitCompareArrows size={16} /></button>
  </article>;
}
