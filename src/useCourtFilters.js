import { useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import courts from "./data/courts.json";
import { distanceKm, isOpenNow, isOpenAt } from "./utils.js";
import useGeo, { locate } from "./useGeo.js";

// Filters (and the selected map pin) live in the URL, e.g. /courts?town=Lipa%20City&open=1
// That way Back, refresh and shared links all restore exactly what you were looking at.
const PARAM = { search: "q", town: "town", type: "type", openOnly: "open", at: "at" };

const rank = (c) => { const o = isOpenNow(c); return o ? 2 : o === null ? 1 : 0; }; // for "open first"

export default function useCourtFilters() {
  const [params, setParams] = useSearchParams();
  const geo = useGeo();
  const me = geo.pos; // your position (GPS, or the town you picked)

  const f = {
    search: params.get("q") || "",
    town: params.get("town") || "All",
    type: params.get("type") || "All",
    amenities: (params.get("amen") || "").split(",").filter(Boolean),
    openOnly: params.get("open") === "1",
    at: params.get("at") || "", // "HH:MM": only courts open at that time
  };

  // replace: true means filter changes don't add history entries, so Back leaves the page in one step
  const update = (changes) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    for (const [key, value] of Object.entries(changes)) {
      if (value === "" || value === "All" || value === false || value == null) next.delete(key);
      else next.set(key, value === true ? "1" : value);
    }
    return next;
  }, { replace: true });

  const set = (key, value) => update({ [PARAM[key]]: value });
  const toggleAmenity = (a) => update({ amen: (f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a]).join(",") });
  const clearAll = () => update({ q: null, town: null, type: null, amen: null, open: null, at: null });
  const select = (id) => update({ c: id });
  const sort = params.get("sort") || (me ? "near" : "name"); // name | open | near
  const view = params.get("view") === "list" ? "list" : "grid";
  const activeCount = (f.town !== "All") + (f.type !== "All") + f.amenities.length + (f.openOnly ? 1 : 0) + (f.at ? 1 : 0);

  const results = useMemo(() => {
    return courts
      .filter((c) => f.town === "All" || c.municipality === f.town)
      .filter((c) => f.type === "All" || c.type === f.type)
      .filter((c) => f.amenities.every((a) => (c.amenities || []).includes(a))) // must have ALL chosen amenities
      .filter((c) => !f.openOnly || isOpenNow(c))
      .filter((c) => !f.at || isOpenAt(c, f.at) === true)
      .filter((c) => `${c.name} ${c.municipality}`.toLowerCase().includes(f.search.toLowerCase()))
      .map((c) => ({ court: c, distance: me ? distanceKm(me.lat, me.lng, c.lat, c.lng) : null }))
      .sort((a, b) => (sort === "near" && me ? a.distance - b.distance
        : sort === "open" ? rank(b.court) - rank(a.court) || a.court.name.localeCompare(b.court.name)
        : a.court.name.localeCompare(b.court.name)));
  }, [params.toString(), me]); // eslint-disable-line react-hooks/exhaustive-deps

  const findNearMe = () => { update({ near: true }); locate(); };
  const trackMe = () => { update({ near: true }); locate({ track: true }); }; // map: keep following you
  const setSort = (value) => { update({ sort: value }); if (value === "near" && !me) findNearMe(); };
  const setView = (value) => update({ view: value === "grid" ? null : value });
  useEffect(() => { if (params.get("near") === "1" && !me) locate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { f, set, toggleAmenity, clearAll, results, findNearMe, trackMe, geoError: "", me, geoSource: geo.source, geoLabel: geo.label, activeCount, selectedId: params.get("c"), select, sort, setSort, view, setView, update };
}
