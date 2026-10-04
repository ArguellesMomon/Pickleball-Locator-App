import { isOpenNow } from "../utils.js";

// Text + color, so it doesn't rely on color alone
export default function OpenBadge({ court }) {
  const open = isOpenNow(court);
  if (open === null) return null; // don't guess when hours are unknown
  return <span className={`badge ${open ? "open" : "closed"}`}>{open ? "Open now" : "Closed"}</span>;
}
