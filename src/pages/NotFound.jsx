import { Link } from "react-router-dom";
import { House, LayoutGrid, Map as MapIcon } from "lucide-react";
import PageHead from "../components/PageHead.jsx";
import CourtVisual from "../components/CourtVisual.jsx";

export default function NotFound() {
  return (
    <>
      <PageHead eyebrow="Error 404" title="Out of bounds!" />
      <div className="page pull">
        <div className="not-found">
          <CourtVisual variant={1} />
          <div>
            <h2>That page isn't on the court.</h2>
            <p className="muted">The link may be old or mistyped. Let's get you back in play.</p>
            <div className="row">
              <Link className="btn primary" to="/"><House size={18} aria-hidden="true" />Home</Link>
              <Link className="btn ghost dark" to="/courts"><LayoutGrid size={18} aria-hidden="true" />Browse courts</Link>
              <Link className="btn ghost dark" to="/map"><MapIcon size={18} aria-hidden="true" />Open the map</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
