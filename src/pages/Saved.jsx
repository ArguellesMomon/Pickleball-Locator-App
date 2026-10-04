import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Heart, Share2, Check, Trash2, Plus, Users } from "lucide-react";
import courts from "../data/courts.json";
import CourtCard from "../components/CourtCard.jsx";
import PageHead from "../components/PageHead.jsx";
import useSaved from "../useSaved.js";
import { isOpenNow } from "../utils.js";

export default function Saved() {
  const { ids, addMany, clear } = useSaved();
  const [params] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [sure, setSure] = useState(false); // "Clear all" asks for a second tap
  const list = courts.filter((c) => ids.includes(c.id));
  const shared = courts.filter((c) => (params.get("ids") || "").split(",").includes(c.id)); // from a friend's link
  const openCount = list.filter((c) => isOpenNow(c)).length;

  async function share() {
    const url = `${window.location.origin}/saved?ids=${ids.join(",")}`;
    if (navigator.share) { try { await navigator.share({ title: "My pickleball courts", text: "Courts I want to play at", url }); } catch { /* cancelled */ } return; }
    await navigator.clipboard.writeText(url);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  }
  function wipe() {
    if (!sure) { setSure(true); setTimeout(() => setSure(false), 3000); return; }
    clear(); setSure(false);
  }

  return (
    <>
      <PageHead eyebrow="Your list" title="Saved courts">
        {list.length > 0 && (
          <div className="pagehead-row">
            <p className="muted"><b>{list.length}</b> saved · <b>{openCount}</b> open now</p>
            <div className="row tight">
              <button type="button" className="btn" onClick={share}>{copied ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}{copied ? "Link copied" : "Share list"}</button>
              <button type="button" className="btn ghost" onClick={wipe}><Trash2 size={18} aria-hidden="true" />{sure ? "Tap again to confirm" : "Clear all"}</button>
            </div>
          </div>
        )}
      </PageHead>
      <div className="page pull">
        {shared.length > 0 && (
          <section className="shared panel">
            <div className="shared-top">
              <span className="shared-icon"><Users size={22} aria-hidden="true" /></span>
              <div><h2>Someone shared {shared.length} {shared.length === 1 ? "court" : "courts"} with you</h2><p className="muted">Add them to your own list to keep them.</p></div>
              <button type="button" className="btn primary" onClick={() => addMany(shared.map((c) => c.id))}><Plus size={18} aria-hidden="true" />Add all</button>
            </div>
            <div className="grid">{shared.map((c) => <CourtCard key={c.id} court={c} />)}</div>
          </section>
        )}
        {list.length === 0 ? (
          <div className="empty">
            <span className="empty-icon"><Heart size={28} aria-hidden="true" /></span>
            <p>Tap the heart on any court to keep it here for quick access.</p>
            <Link className="btn" to="/courts">Browse courts</Link>
          </div>
        ) : (
          <div className="grid">{list.map((c) => <CourtCard key={c.id} court={c} />)}</div>
        )}
      </div>
    </>
  );
}
