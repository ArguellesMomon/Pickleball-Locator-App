import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight, Clock3 } from "lucide-react";
import OpenBadge from "./OpenBadge.jsx";
import SaveButton from "./SaveButton.jsx";
import Img from "./Img.jsx";
import { AMENITY_ICONS } from "../icons.jsx";
import { formatHours } from "../utils.js";

// One court in the list. Every detail is optional, so a court with little info still looks fine.
export default function CourtCard({ court, distance, onHover }) {
  return (
    <div className="card-wrap reveal">
      <Link to={`/courts/${court.id}`} className="card" onMouseEnter={() => onHover?.(court.id)} onMouseLeave={() => onHover?.(null)}>
        <Img src={court.photos[0]} alt={court.name} />
        <div className="card-body">
          <div className="card-top"><h3>{court.name}</h3><ArrowUpRight className="go" size={18} aria-hidden="true" /></div>
          <p className="muted meta"><MapPin size={14} aria-hidden="true" />{court.municipality}{distance != null && ` · ${distance.toFixed(1)} km away`}</p>
          <p className="meta2"><Clock3 size={14} aria-hidden="true" />{formatHours(court)}</p>
          <p className="tags">
            <OpenBadge court={court} />
            {court.type && <span className="tag">{court.type}</span>}
            {court.fee && <span className={`tag ${court.fee === "Free" ? "free" : ""}`}>{court.fee}</span>}
            {(court.amenities || []).slice(0, 2).map((a) => {
              const Icon = AMENITY_ICONS[a];
              return <span key={a} className="tag">{Icon && <Icon size={12} aria-hidden="true" />}{a}</span>;
            })}
          </p>
        </div>
      </Link>
      <SaveButton court={court} />
    </div>
  );
}
