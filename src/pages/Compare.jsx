import { Link } from "react-router-dom";
import { X, GitCompareArrows, ArrowRight, Check, Minus } from "lucide-react";
import courts from "../data/courts.json";
import useCompare from "../useCompare.js";
import PageHead from "../components/PageHead.jsx";
import CourtVisual from "../components/CourtVisual.jsx";
import SaveButton from "../components/SaveButton.jsx";
import { AMENITIES, formatHours } from "../utils.js";
export default function Compare() {
  const {
    ids,
    toggle,
    clear
  } = useCompare();
  const selected = ids.map(id => courts.find(c => c.id === id)).filter(Boolean);
  const rows = [["Town", c => c.municipality], ["Opening hours", formatHours], ["Court count", c => c.courtCount || "Not listed"], ["Court type", c => c.type || "Not listed"], ["Rates", c => c.rates || c.fee || "Not listed"], ["Phone", c => c.phone || "Not listed"]];
  return <><PageHead eyebrow="YOUR SHORTLIST" title="A court-to-court comparison"><p className="muted">Find the right fit. Compare up to three venues side by side.</p></PageHead><div className="page">
  {selected.length ? <><div className="compare-toolbar"><Link className="btn ghost dark" to="/courts">Add another court<ArrowRight size={16} /></Link><button className="linkbtn" onClick={clear}>Clear comparison</button></div><div className="comparison-scroll"><table className="comparison-table"><caption className="sr-only">Comparison of selected pickleball courts</caption><thead><tr><th scope="col">Court details</th>{selected.map((c, i) => <th scope="col" key={c.id}><div className="comparison-court"><CourtVisual variant={i} /><button className="clear" aria-label={"Remove " + c.name + " from comparison"} onClick={() => toggle(c.id)}><X size={16} /></button><Link to={"/courts/" + c.id}>{c.name}<ArrowRight size={14} /></Link><SaveButton court={c} /></div></th>)}</tr></thead><tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th>{selected.map(c => <td key={c.id}>{value(c)}</td>)}</tr>)}{AMENITIES.map(a => <tr key={a}><th scope="row">{a}</th>{selected.map(c => <td key={c.id}>{c.amenities?.includes(a) ? <span className="compare-yes"><Check size={16} />Listed</span> : <span className="muted"><Minus size={14} />Not listed</span>}</td>)}</tr>)}</tbody></table></div><p className="muted comparison-note">“Not listed” means we don’t have that information yet. Check with the venue before you go.</p></> : <div className="empty"><GitCompareArrows size={32} /><h2>Which court is your kind of court?</h2><p>Use the comparison button on any court card to start a shortlist.</p><Link to="/courts" className="btn primary">Find courts<ArrowRight size={16} /></Link></div>}
  </div></>;
}
