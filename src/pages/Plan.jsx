import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Share2, Copy, Check, CalendarPlus, Navigation, Info } from "lucide-react";
import courts from "../data/courts.json";
import PageHead from "../components/PageHead.jsx";
import { manilaMinutes, isOpenAtMinutes, formatHours, to12h, downloadIcs } from "../utils.js";

const pad = (n) => String(n).padStart(2, "0");
const todayManila = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date()); // YYYY-MM-DD
const nextHour = () => `${pad(Math.min(Math.floor(manilaMinutes() / 60) + 1, 21))}:00`;

// Pick a court and a time, get a ready-to-send invite for the group chat plus a calendar file
export default function Plan() {
  const [params, setParams] = useSearchParams();
  const sorted = useMemo(() => [...courts].sort((a, b) => a.name.localeCompare(b.name)), []);
  const court = courts.find((c) => c.id === params.get("c")) || sorted[0];
  const [date, setDate] = useState(todayManila);
  const [time, setTime] = useState(nextHour);
  const [hours, setHours] = useState(2);
  const [players, setPlayers] = useState(4);
  const [note, setNote] = useState("");
  const [done, setDone] = useState("");

  const [h, m] = time.split(":").map(Number);
  const start = h * 60 + m, end = start + hours * 60;
  const fits = court.open ? isOpenAtMinutes(court, start % 1440) && isOpenAtMinutes(court, (end - 1) % 1440) : null;
  const endTime = `${pad(Math.floor(end / 60) % 24)}:${pad(end % 60)}`;
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const link = `${window.location.origin}/courts/${court.id}`;
  const message = [`🏓 Pickleball at ${court.name}`, `📅 ${dateLabel}, ${to12h(time)} to ${to12h(endTime)}`, `📍 ${court.address}`, `👥 Looking for ${players} ${players === 1 ? "player" : "players"}`, note && `📝 ${note}`, "", `Details and directions: ${link}`].filter((l) => l !== false && l !== "").join("\n");

  const flash = (what) => { setDone(what); setTimeout(() => setDone(""), 2500); };
  async function share() {
    if (navigator.share) { try { await navigator.share({ title: `Pickleball at ${court.name}`, text: message }); flash("shared"); } catch { /* cancelled */ } return; }
    await navigator.clipboard.writeText(message); flash("copied");
  }
  async function copy() { await navigator.clipboard.writeText(message); flash("copied"); }

  return (
    <>
      <PageHead eyebrow="Plan a game" title="Get your group on court">
        <p className="muted lede-light">Pick a court and a time. We'll make an invite you can send to your group chat, and a calendar reminder.</p>
      </PageHead>
      <div className="page pull">
        <div className="plan-page">
          <form className="panel suggest" onSubmit={(e) => e.preventDefault()}>
            <label>Court
              <select value={court.id} onChange={(e) => setParams({ c: e.target.value }, { replace: true })}>
                {sorted.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.municipality}</option>)}
              </select>
            </label>
            <div className="two"><label>Date<input type="date" value={date} min={todayManila()} onChange={(e) => setDate(e.target.value)} /></label>
              <label>Start time<input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label></div>
            <div className="two">
              <label>How long
                <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>{[1, 1.5, 2, 3].map((n) => <option key={n} value={n}>{n} {n === 1 ? "hour" : "hours"}</option>)}</select>
              </label>
              <label>Players needed<input type="number" min="1" max="12" value={players} onChange={(e) => setPlayers(Math.min(12, Math.max(1, Number(e.target.value) || 1)))} /></label>
            </div>
            <label>Note (optional)<textarea rows="2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bring water, beginners welcome, split the court fee..." /></label>
            {fits === false && <p className="note warn"><Info size={18} aria-hidden="true" />{court.name} is listed as open {formatHours(court)}. That time is outside those hours.</p>}
            {fits === null && <p className="note"><Info size={18} aria-hidden="true" />Hours aren't listed for this court. Call ahead to confirm before you invite people.</p>}
            {fits === true && <p className="note ok"><Check size={18} aria-hidden="true" />Within opening hours ({formatHours(court)}).</p>}
          </form>

          <aside className="invite-wrap">
            <div className="invite" aria-label="Invite preview">
              <p className="eyebrow light">Invite preview</p>
              <pre>{message}</pre>
            </div>
            <div className="invite-actions">
              <button type="button" className="btn" onClick={share}>{done === "shared" || done === "copied" ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}{done === "copied" ? "Copied" : done === "shared" ? "Shared" : "Share invite"}</button>
              <button type="button" className="btn ghost dark" onClick={copy}><Copy size={18} aria-hidden="true" />Copy text</button>
              <button type="button" className="btn ghost dark" onClick={() => downloadIcs({ title: `Pickleball at ${court.name}`, date, time, minutes: hours * 60, location: court.address, description: message })}><CalendarPlus size={18} aria-hidden="true" />Add to calendar</button>
              <a className="btn ghost dark" href={`https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`} target="_blank" rel="noreferrer"><Navigation size={18} aria-hidden="true" />Directions</a>
            </div>
            <p className="muted"><Link to={`/courts/${court.id}`}>View {court.name}</Link></p>
          </aside>
        </div>
      </div>
    </>
  );
}
