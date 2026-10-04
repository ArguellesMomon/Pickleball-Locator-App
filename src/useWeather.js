import { useEffect, useState } from "react";

// Free forecast from Open-Meteo (no key). Cached for 30 minutes per spot. null = loading, false = unavailable.
function shape(j) {
  const i = Math.max(0, j.hourly.time.findIndex((t) => t.slice(0, 13) === j.current.time.slice(0, 13)));
  const hours = j.hourly.time.slice(i, i + 12).map((t, k) => ({ hour: Number(t.slice(11, 13)), temp: Math.round(j.hourly.temperature_2m[i + k]), rain: j.hourly.precipitation_probability[i + k] ?? 0 }));
  return { temp: Math.round(j.current.temperature_2m), code: j.current.weather_code, hours };
}

export default function useWeather(lat, lng) {
  const [wx, setWx] = useState(null);
  useEffect(() => {
    const key = `wx:${lat.toFixed(2)},${lng.toFixed(2)}`;
    try { const hit = JSON.parse(sessionStorage.getItem(key)); if (hit && Date.now() - hit.t < 30 * 60 * 1000) { setWx(hit.data); return; } } catch { /* ignore */ }
    const ctl = new AbortController();
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&hourly=precipitation_probability,temperature_2m&timezone=Asia%2FManila&forecast_days=2`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => { const data = shape(j); try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data })); } catch { /* ignore */ } setWx(data); })
      .catch(() => { if (!ctl.signal.aborted) setWx(false); });
    return () => ctl.abort();
  }, [lat, lng]);
  return wx;
}
