import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Goes back to wherever you actually came from (map, list, saved...).
// If this page was opened directly (shared link), it goes to a sensible fallback instead.
export default function BackButton({ fallback = "/courts", label = "All courts" }) {
  const navigate = useNavigate();
  const { key } = useLocation();
  const hasHistory = key !== "default"; // "default" = the first page of this visit
  return (
    <button type="button" className="back" onClick={() => (hasHistory ? navigate(-1) : navigate(fallback))}>
      <ArrowLeft size={16} aria-hidden="true" />{hasHistory ? "Back" : label}
    </button>
  );
}
