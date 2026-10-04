export const AMENITIES = ["Lights", "Parking", "Restrooms", "Paddle rental", "Covered"];

// Straight-line distance in km between two lat/lng points (haversine formula)
export function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

const toMinutes = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

// Minutes since midnight in the Philippines, so "open now" is right for any visitor's timezone
export function manilaMinutes() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  return get("hour") * 60 + get("minute");
}

// Court data uses 24h times ("06:00"). Use "24:00" as the closing time for midnight.
export function isOpenAtMinutes(court, m) {
  if (!court.open || !court.close) return null; // hours unknown
  const open = toMinutes(court.open), close = toMinutes(court.close);
  return open <= close ? m >= open && m < close : m >= open || m < close; // second case: closes after midnight
}
export const isOpenNow = (court) => isOpenAtMinutes(court, manilaMinutes());
export const isOpenAt = (court, hhmm) => isOpenAtMinutes(court, toMinutes(hhmm)); // e.g. isOpenAt(court, "18:00")

export function to12h(t) {
  const [h, m] = t.split(":").map(Number);
  const hh = h % 24;
  return `${hh % 12 || 12}:${String(m).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`;
}
export function formatHours(court) {
  if (!court.open || !court.close) return "Hours not listed";
  if (court.open === "00:00" && court.close === "24:00") return "Open 24 hours";
  return `${to12h(court.open)} – ${to12h(court.close)}`;
}

// Phones open the share sheet (Messenger, Viber...); desktops copy the link instead
export async function shareCourt(court) {
  const url = `${window.location.origin}/courts/${court.id}`;
  if (navigator.share) {
    try { await navigator.share({ title: court.name, text: `Play pickleball at ${court.name}`, url }); } catch { /* cancelled */ }
    return "shared";
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}

// Live status for a court: open/closed, a friendly sentence, and the opening window as 0..1 positions on a 24h bar
export function openStatus(court) {
  if (!court.open || !court.close) return null;
  const now = manilaMinutes(), open = toMinutes(court.open), close = toMinutes(court.close);
  const isOpen = isOpenNow(court);
  const until = (target) => { let d = target - now; if (d <= 0) d += 1440; return d; };
  const human = (d) => (d >= 60 ? `${Math.floor(d / 60)}h ${d % 60}m` : `${d}m`);
  const segments = open <= close ? [[open / 1440, close / 1440]] : [[0, close / 1440], [open / 1440, 1]];
  let text;
  if (open === 0 && close === 1440) text = "Open all day, every day";
  else if (isOpen) text = `Closes at ${to12h(court.close)} · in ${human(until(close % 1440))}`;
  else text = `Opens at ${to12h(court.open)} · in ${human(until(open))}`;
  return { open: isOpen, text, segments, pct: now / 1440 };
}

// Real photos when the court has them; otherwise sample artwork so the gallery still works
const SAMPLE = [["/images/placeholder.svg", "the court from above"], ["/images/placeholder-net.svg", "the net"], ["/images/placeholder-paddles.svg", "paddles and ball"], ["/images/placeholder-night.svg", "the courts at night"]];
export function courtPhotos(court) {
  const real = (court.photos || []).filter((p) => !p.includes("placeholder"));
  if (real.length) return { sample: false, photos: real.map((src, i) => ({ src, alt: `${court.name}, photo ${i + 1}` })) };
  return { sample: true, photos: SAMPLE.map(([src, what]) => ({ src, alt: `Sample artwork: ${what}` })) };
}

// A readable intro built only from what we know about the court
export function describeCourt(c) {
  const parts = [`${c.name} is a${c.type ? "n " + c.type.toLowerCase() : ""} pickleball venue in ${c.municipality}, Batangas${c.courtCount ? ` with ${c.courtCount} courts` : ""}.`];
  if (c.open && c.close) parts.push(c.open === "00:00" && c.close === "24:00" ? "It is listed as open 24 hours." : `It is listed as open ${formatHours(c)}.`);
  else parts.push("Opening hours aren't listed yet, so it's best to call ahead.");
  if ((c.amenities || []).length) parts.push(`On site: ${c.amenities.join(", ").toLowerCase()}.`);
  return parts.join(" ");
}

// Downloads an .ics calendar file (Philippine time is UTC+8 all year, so we convert to UTC for every calendar app)
export function downloadIcs({ title, date, time, minutes, location, description }) {
  const [y, mo, d] = date.split("-").map(Number), [h, mi] = time.split(":").map(Number);
  const stamp = (offset) => new Date(Date.UTC(y, mo - 1, d, h - 8, mi + offset)).toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const esc = (t) => String(t).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => "\\" + c);
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Pickle Batangas//EN", "BEGIN:VEVENT", `UID:${Date.now()}@pickle-batangas`, `DTSTAMP:${stamp(0)}`,
    `DTSTART:${stamp(0)}`, `DTEND:${stamp(minutes)}`, `SUMMARY:${esc(title)}`, `LOCATION:${esc(location)}`, `DESCRIPTION:${esc(description)}`, "END:VEVENT", "END:VCALENDAR"];
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url; a.download = "pickleball-game.ics"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
