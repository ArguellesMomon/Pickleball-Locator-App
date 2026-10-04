import L from "leaflet";
const dot = '<span class="pin-dot"></span>'; // styled in CSS
const make = (cls, size) => L.divIcon({ className: cls, html: dot, iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size / 2 - 1] });
export const normalIcon = make("pin", 26);          // open now (yellow)
export const closedIcon = make("pin closed", 24);   // closed right now (grey)
export const unknownIcon = make("pin unknown", 24); // hours not listed (white, dashed)
export const activeIcon = make("pin active", 34);   // selected or hovered
