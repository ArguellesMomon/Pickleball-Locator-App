import { Heart } from "lucide-react";
import useSaved from "../useSaved.js";

export default function SaveButton({ court, className = "" }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(court.id);
  return (
    <button type="button" className={`save ${className}`} aria-pressed={saved}
      aria-label={saved ? `Remove ${court.name} from saved` : `Save ${court.name}`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(court.id); }}>
      <Heart size={20} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
