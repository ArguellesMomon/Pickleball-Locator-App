import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, CloudFog } from "lucide-react";
import useWeather from "../useWeather.js";

const describe = (code) => code === 0 ? ["Clear", Sun] : code <= 3 ? ["Partly cloudy", CloudSun] : code <= 48 ? ["Foggy", CloudFog]
  : (code <= 67 || (code >= 80 && code <= 82)) ? ["Rain", CloudRain] : code >= 95 ? ["Thunderstorms", CloudLightning] : ["Cloudy", Cloud];
const hourLabel = (h) => `${h % 12 || 12}${h < 12 ? "a" : "p"}`;

function verdict(wx) {
  const soon = Math.max(...wx.hours.slice(0, 3).map((h) => h.rain));
  if (soon >= 60) return { tone: "bad", text: "Rain is likely soon. Keep a backup plan." };
  if (wx.temp >= 34) return { tone: "warn", text: "Very hot. Play early morning or after sunset." };
  if (wx.temp >= 31) return { tone: "warn", text: "Warm out there. Bring plenty of water." };
  return { tone: "good", text: "Good conditions to play." };
}

// "Should I go now?" for outdoor courts: temperature, conditions and the next 12 hours of rain chance
export default function WeatherCard({ court }) {
  const wx = useWeather(court.lat, court.lng);
  if (wx === false) return null;
  if (wx === null) return <div className="wx wx-load" aria-hidden="true" />;
  const [label, Icon] = describe(wx.code), v = verdict(wx);
  return (
    <div className="wx">
      <div className="wx-top">
        <Icon size={28} aria-hidden="true" />
        <div><b>{wx.temp}°C</b><span>{label}</span></div>
        <p className={`wx-verdict ${v.tone}`}>{v.text}</p>
      </div>
      <div className="wx-bars" role="img" aria-label="Chance of rain for the next 12 hours">
        {wx.hours.map((h, i) => <span key={h.hour}><i style={{ height: `${Math.max(8, h.rain)}%` }} title={`${hourLabel(h.hour)}: ${h.rain}% rain`} /><small>{i % 3 === 0 ? hourLabel(h.hour) : ""}</small></span>)}
      </div>
      <p className="wx-credit">Chance of rain by hour · Weather by Open-Meteo</p>
    </div>
  );
}

// Small chip for the Explore hero
export function WeatherChip() {
  const wx = useWeather(13.95, 121.05);
  if (!wx) return null;
  const [label, Icon] = describe(wx.code);
  return <p className="wx-chip"><Icon size={16} aria-hidden="true" />{wx.temp}°C · {label} · {Math.max(...wx.hours.slice(0, 6).map((h) => h.rain))}% rain chance soon</p>;
}
