import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Link } from "react-router-dom";
import { Navigation } from "lucide-react";
import OpenBadge from "./OpenBadge.jsx";
import { normalIcon, closedIcon, unknownIcon, activeIcon } from "../mapIcons.js";
import { isOpenNow } from "../utils.js";

const statusIcon = (c) => { const open = isOpenNow(c); return open === null ? unknownIcon : open ? normalIcon : closedIcon; };

const VIEW_KEY = "pickle-map-view";
const DEFAULT_VIEW = { center: [13.95, 121.05], zoom: 9 };
function savedView() { try { return JSON.parse(sessionStorage.getItem(VIEW_KEY)) || DEFAULT_VIEW; } catch { return DEFAULT_VIEW; } }

// Lives inside the map so it can use the map object: remembers the view, flies to a focus point, handles background taps
function MapEffects({ focus, onBackgroundClick }) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    const zoom = Math.max(map.getZoom(), focus.zoom ?? 14);
    const target = map.project([focus.lat, focus.lng], zoom).add([0, focus.offsetY || 0]); // shift so the pin clears the bottom sheet
    map.flyTo(map.unproject(target, zoom), zoom, { duration: 0.6 });
  }, [focus, map]);
  useMapEvents({
    moveend: () => sessionStorage.setItem(VIEW_KEY, JSON.stringify({ center: [map.getCenter().lat, map.getCenter().lng], zoom: map.getZoom() })),
    click: () => onBackgroundClick?.(),
  });
  return null;
}

// Zooms to the courts you are looking at when the results change (or the "fit all" button is pressed)
function FitResults({ results, fitTick, fitPadding }) {
  const map = useMap(), first = useRef(true);
  const key = results.map((r) => r.court.id).join(",");
  useEffect(() => {
    if (first.current) { first.current = false; return; } // keep the remembered view on arrival
    if (!results.length) return;
    map.fitBounds(L.latLngBounds(results.map((r) => [r.court.lat, r.court.lng])), {
      paddingTopLeft: [40, fitPadding?.top ?? 60], paddingBottomRight: [40, fitPadding?.bottom ?? 60], maxZoom: 15,
    });
  }, [key, fitTick]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// Shared by the desktop and phone map pages. `popups` = desktop bubbles; phones use the bottom sheet via onSelect.
export default function CourtMap({ results, activeId, onSelect, popups = false, focus, me, onBackgroundClick, zoomControl = true, fitTick = 0, fitPadding }) {
  const view = savedView(); // coming back from a court page keeps the map where you left it
  return (
    <MapContainer center={view.center} zoom={view.zoom} className="map" zoomControl={zoomControl}>
      <MapEffects focus={focus} onBackgroundClick={onBackgroundClick} />
      <FitResults results={results} fitTick={fitTick} fitPadding={fitPadding} />
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MarkerClusterGroup chunkedLoading maxClusterRadius={45} showCoverageOnHover={false}>
        {results.map(({ court }) => (
          <Marker key={court.id} position={[court.lat, court.lng]} icon={court.id === activeId ? activeIcon : statusIcon(court)}
            zIndexOffset={court.id === activeId ? 1000 : 0} eventHandlers={{ click: () => onSelect?.(court) }}>
            {popups && (
              <Popup>
                <div className="pop">
                  <strong>{court.name}</strong>
                  <span>{[court.municipality, court.type, court.fee].filter(Boolean).join(" · ")}</span>
                  <OpenBadge court={court} />
                  <div className="pop-links">
                    <Link to={`/courts/${court.id}`}>View details</Link>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`} target="_blank" rel="noreferrer"><Navigation size={14} aria-hidden="true" />Directions</a>
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MarkerClusterGroup>
      {me && <CircleMarker center={[me.lat, me.lng]} radius={8} pathOptions={{ color: "#fff", weight: 3, fillColor: "#1f6fb2", fillOpacity: 1 }} />}
    </MapContainer>
  );
}
