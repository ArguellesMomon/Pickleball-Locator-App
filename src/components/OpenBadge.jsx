import { isOpenNow } from "../utils.js";
import useNow from "../useNow.js";
export default function OpenBadge({court}) {
  useNow();
  const open=isOpenNow(court);
  return <span className={"badge "+(open===null?"unknown":open?"open":"closed")}>{open===null?"Hours not listed":open?"Open now":"Closed"}</span>;
}
