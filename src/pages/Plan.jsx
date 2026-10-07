import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Share2, Copy, Check, CalendarPlus, Navigation, Info, BookmarkCheck } from "lucide-react";
import useNow from "../useNow.js";
import courts from "../data/courts.json";
import PageHead from "../components/PageHead.jsx";
import { manilaMinutes, isOpenDuring, formatHours, to12h, downloadIcs, copyText } from "../utils.js";
import { showToast } from "../components/Toaster.jsx";
const pad = n => String(n).padStart(2, "0");
export const todayManila = () => {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const get = t => p.find(x => x.type === t).value;
  return get("year") + "-" + get("month") + "-" + get("day");
};
const KEY = "pickle-plan-draft";
function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}
export default function Plan() {
  useNow();
  const [params, setParams] = useSearchParams();
  const sorted = useMemo(() => [...courts].sort((a, b) => a.name.localeCompare(b.name)), []);
  const [draft] = useState(readDraft);
  const court = courts.find(c => c.id === (params.get("c") || draft.court)) || sorted[0];
  const nextHour = Math.floor(manilaMinutes() / 60) + 1;
  const slotDate = new Date(todayManila() + "T00:00:00Z");
  if (nextHour >= 24) slotDate.setUTCDate(slotDate.getUTCDate() + 1);
  const [date, setDate] = useState(draft.date >= todayManila() ? draft.date : slotDate.toISOString().slice(0, 10));
  const [time, setTime] = useState(/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.time || "") ? draft.time : pad(nextHour % 24) + ":00");
  const [hours, setHours] = useState([1, 1.5, 2, 3].includes(draft.hours) ? draft.hours : 2);
  const [players, setPlayers] = useState(draft.players >= 1 && draft.players <= 12 ? draft.players : 4);
  const [note, setNote] = useState(typeof draft.note === "string" ? draft.note : "");
  const [done, setDone] = useState("");
  const start = time ? /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) : NaN : NaN;
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(date + "T12:00:00").getTime()) && date >= todayManila();
  const past = date === todayManila() && start <= manilaMinutes();
  const valid = validDate && Number.isFinite(start) && !past;
  const fits = Number.isFinite(start) ? isOpenDuring(court, start, hours * 60) : null;
  const end = start + hours * 60;
  const endTime = Number.isFinite(end) ? pad(Math.floor(end / 60) % 24) + ":" + pad(end % 60) : "";
  const nextDay = end >= 1440;
  const dateLabel = validDate ? new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }) : "Choose a date";
  const link = window.location.origin + "/courts/" + court.id;
  const message = ["🏓 Pickleball at " + court.name, "📅 " + dateLabel + ", " + (time ? to12h(time) : "Choose a time") + " to " + (endTime ? to12h(endTime) : "—") + (nextDay ? " (next day)" : ""), "📍 " + court.address, "👥 Looking for " + players + " " + (players === 1 ? "player" : "players"), note.trim() && "📝 " + note.trim(), "", "Details and directions: " + link].filter(l => l !== false).join("\n");
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        court: court.id,
        date,
        time,
        hours,
        players,
        note
      }));
    } catch {}
  }, [court.id, date, time, hours, players, note]);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(""), 2500);
    return () => clearTimeout(t);
  }, [done]);
  async function copy() {
    if (!valid) return;
    if (await copyText(message)) setDone("copied");
  }
  async function share() {
    if (!valid) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pickleball at " + court.name,
          text: message
        });
        setDone("shared");
      } catch (e) {
        if (e.name !== "AbortError") showToast("Sharing is unavailable. Try Copy text.");
      }
    } else await copy();
  }
  return <><PageHead eyebrow="MAKE TIME TO PLAY" title="Good games start with a plan."><p className="muted lede-light">Pick a court. Gather your crew. We’ll put the invite together.</p></PageHead><div className="page pull"><p className="draft-note"><BookmarkCheck size={15} />Your draft stays saved in this browser. Times are in Philippine time.</p><div className="plan-page"><div><div className="section-head"><div><p className="eyebrow">01 · SET IT UP</p><h2>Your game details</h2></div></div><form className="panel suggest" onSubmit={e => e.preventDefault()}>
    <label>Court<select value={court.id} onChange={e => setParams({
                c: e.target.value
              }, {
                replace: true
              })}>{sorted.map(c => <option key={c.id} value={c.id}>{c.name + " · " + c.municipality}</option>)}</select></label>
    <div className="two"><label>Date<input type="date" value={date} min={todayManila()} required onChange={e => setDate(e.target.value)} /></label><label>Start time<input type="time" value={time} required onChange={e => setTime(e.target.value)} /></label></div>
    <div className="two"><label>Game duration<select value={hours} onChange={e => setHours(Number(e.target.value))}>{[1, 1.5, 2, 3].map(n => <option key={n} value={n}>{n + " " + (n === 1 ? "hour" : "hours")}</option>)}</select></label><label>Players needed<input type="number" min="1" max="12" value={players} onChange={e => setPlayers(Math.min(12, Math.max(1, Number(e.target.value) || 1)))} /></label></div>
    <label>Anything else? <span className="muted">(optional)</span><textarea rows="3" value={note} maxLength={1000} onChange={e => setNote(e.target.value)} placeholder="Beginners welcome, bring water, split the court fee…" /></label>
    {!valid && <p className="plan-invalid" role="status">{past ? "Choose a start time in the future." : !validDate ? "Choose today or a future date." : "Choose a start time to finish your invite."}</p>}
    {fits === false && <p className="note warn"><Info size={17} />{court.name} is listed as open {formatHours(court)}. Your game extends outside these hours.</p>}
    {fits === null && <p className="note"><Info size={17} />Hours aren’t listed for this court. Confirm with the venue before sharing your invite.</p>}
    {fits === true && <p className="note ok"><Check size={17} />Your game fits the listed hours ({formatHours(court)}).</p>}
    <p className="muted">This creates an invitation, not a court reservation.</p>
  </form></div><aside className="invite-wrap"><div className="section-head"><div><p className="eyebrow">02 · BRING YOUR PEOPLE</p><h2>Your invite, ready to go.</h2></div></div><div className="invite" aria-label="Invite preview"><p className="eyebrow light">THE GROUP CHAT STARTER</p><pre>{message}</pre></div><div className="invite-actions">
  <button className="btn" disabled={!valid} onClick={share}>{done ? <Check size={18} /> : <Share2 size={18} />} {done === "copied" ? "Invite copied" : done === "shared" ? "Invite shared" : "Share invite"}</button>
  <button className="btn ghost dark" disabled={!valid} onClick={copy}><Copy size={17} />Copy text</button>
  <button className="btn ghost dark" disabled={!valid} onClick={() => downloadIcs({
              title: "Pickleball at " + court.name,
              date,
              time,
              minutes: hours * 60,
              location: court.address,
              description: message
            })}><CalendarPlus size={17} />Add to calendar</button>
  <a className="btn ghost dark" href={"https://www.google.com/maps/dir/?api=1&destination=" + court.lat + "," + court.lng} target="_blank" rel="noreferrer"><Navigation size={17} />Get directions</a></div><p className="muted"><Link to={"/courts/" + court.id}>Explore {court.name} →</Link></p></aside></div></div></>;
}
