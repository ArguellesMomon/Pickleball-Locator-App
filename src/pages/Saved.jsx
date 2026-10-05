import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Heart, Share2, Check, Trash2, Plus, Users, LayoutGrid, List, CalendarDays } from "lucide-react";
import courts from "../data/courts.json";
import CourtCard from "../components/CourtCard.jsx";
import PageHead from "../components/PageHead.jsx";
import BackButton from "../components/BackButton.jsx";
import Rail from "../components/Rail.jsx";
import useSaved from "../useSaved.js";
import useMedia from "../useMedia.js";
import { isOpenNow } from "../utils.js";

const VIEW_KEY = "pickle-saved-view";

export default function Saved() {
  const { ids, addMany, clear } = useSaved();
  const [params] = useSearchParams();
  const phone = useMedia("(max-width: 600px)");
  const [view, setViewState] = useState(() => localStorage.getItem(VIEW_KEY) || (phone ? "list" : "grid")); // compact rows suit phones
  const [copied, setCopied] = useState(false);
  const [sure, setSure] = useState(false); // "Clear all" asks for a second tap
  const setView = (v) => { setViewState(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* private mode */ } };

  const list = courts.filter((c) => ids.includes(c.id));
  const shared = courts.filter((c) => (params.get("ids") || "").split(",").includes(c.id)); // from a friend's link
  const fresh = shared.filter((c) => !ids.includes(c.id));
  const openCount = list.filter((c) => isOpenNow(c)).length;
  const suggestions = courts.filter((c) => isOpenNow(c)).slice(0, 8);

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
      <PageHead back={<BackButton fallback={null} />} eyebrow="Your list" title="Saved courts">
        {list.length > 0 && (
          <div className="pagehead-row">
            <p className="muted"><b>{list.length}</b> saved · <b>{openCount}</b> open now</p>
            <div className="row tight">
              <Link className="btn" to={`/plan?c=${list[0].id}`}><CalendarDays size={18} aria-hidden="true" />Plan a game</Link>
              <button type="button" className="btn ghost" onClick={share}>{copied ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}{copied ? "Link copied" : "Share list"}</button>
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
              <div>
                <h2>Someone shared {shared.length} {shared.length === 1 ? "court" : "courts"} with you</h2>
                <p className="muted">{fresh.length ? `${fresh.length} new to your list.` : "You already have all of these saved."}</p>
              </div>
              <button type="button" className="btn primary" disabled={!fresh.length} onClick={() => addMany(fresh.map((c) => c.id))}>
                <Plus size={18} aria-hidden="true" />{fresh.length ? `Add ${fresh.length} to my list` : "Already saved"}
              </button>
            </div>
            <div className={`grid ${view === "list" ? "list" : ""}`}>{shared.map((c) => <CourtCard key={c.id} court={c} />)}</div>
          </section>
        )}

        {list.length === 0 ? (
          <>
            <div className="empty">
              <span className="empty-icon"><Heart size={28} aria-hidden="true" /></span>
              <p>Tap the heart on any court to keep it here for quick access.</p>
              <Link className="btn" to="/courts">Browse courts</Link>
            </div>
            {suggestions.length > 0 && (
              <section className="saved-suggest reveal">
                <div className="section-head"><div><p className="eyebrow">Start here</p><h2>Open right now</h2></div></div>
                <Rail label="Courts open now">{suggestions.map((c) => <CourtCard key={c.id} court={c} />)}</Rail>
              </section>
            )}
          </>
        ) : (
          <>
            <div className="toolbar">
              <p className="muted">Tap a heart to remove a court.</p>
              <div className="tools">
                <div className="seg-toggle" role="group" aria-label="Layout">
                  <button type="button" aria-pressed={view === "grid"} aria-label="Grid view" onClick={() => setView("grid")}><LayoutGrid size={18} /></button>
                  <button type="button" aria-pressed={view === "list"} aria-label="List view" onClick={() => setView("list")}><List size={18} /></button>
                </div>
              </div>
            </div>
            <div className={`grid ${view === "list" ? "list" : ""}`}>{list.map((c) => <CourtCard key={c.id} court={c} />)}</div>
          </>
        )}
      </div>
    </>
  );
}
