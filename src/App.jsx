import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, NavLink, Link, Navigate, useLocation, useNavigationType } from "react-router-dom";
import { Compass, LayoutGrid, Map as MapIcon, CalendarDays, Heart, Search, Sun, Moon, ArrowUpRight, GitCompareArrows, X } from "lucide-react";
import Landing from "./pages/Landing.jsx";
import Courts from "./pages/Courts.jsx";
import Saved from "./pages/Saved.jsx";
import NotFound from "./pages/NotFound.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import QuickSearch from "./components/QuickSearch.jsx";
import GeoDialog from "./components/GeoDialog.jsx";
import Toaster from "./components/Toaster.jsx";
import ScrollTop from "./components/ScrollTop.jsx";
import useSaved from "./useSaved.js";
import useTheme from "./useTheme.js";
import useCompare from "./useCompare.js";
import courts from "./data/courts.json";
import { CONTACT_EMAIL, DEVELOPER } from "./config.js";
const MapPage = lazy(() => import("./pages/MapPage.jsx"));
const CourtDetail = lazy(() => import("./pages/CourtDetail.jsx"));
const Plan = lazy(() => import("./pages/Plan.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Compare = lazy(() => import("./pages/Compare.jsx"));
const TABS = [["/", "Discover", Compass], ["/courts", "Courts", LayoutGrid], ["/map", "Map", MapIcon], ["/plan", "Plan a game", CalendarDays], ["/saved", "Saved", Heart]];
const BallMark = () => <svg className="mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="10" fill="#d6ee8a" /><circle cx="16" cy="16" r="10" fill="#244c3c" />{[[12, 12], [19, 11], [22, 17], [11, 19], [16, 16], [18, 22]].map(([x, y]) => <circle key={x + "-" + y} cx={x} cy={y} r="1.4" fill="#d6ee8a" />)}</svg>;
export default function App() {
  const {
    pathname,
    key,
    hash
  } = useLocation();
  const navType = useNavigationType();
  const {
    ids
  } = useSaved();
  const compare = useCompare();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    let saved = null,
      poll;
    try {
      saved = sessionStorage.getItem("scroll:" + key);
    } catch {}
    if (navType === "POP" && saved !== null) window.scrollTo(0, Number(saved));else if (hash) {
      let tries = 0;
      poll = setInterval(() => {
        let el;
        try {
          el = document.getElementById(decodeURIComponent(hash.slice(1)));
        } catch {}
        if (el || ++tries > 20) {
          clearInterval(poll);
          el?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }, 100);
    } else if (navType !== "REPLACE") window.scrollTo(0, 0);
    const save = () => {
      try {
        sessionStorage.setItem("scroll:" + key, String(window.scrollY));
      } catch {}
    };
    window.addEventListener("scroll", save, {
      passive: true
    });
    return () => {
      clearInterval(poll);
      window.removeEventListener("scroll", save);
    };
  }, [key, hash, navType]);
  useEffect(() => {
    document.body.classList.toggle("on-map", pathname === "/map");
    document.body.classList.remove("dock-hidden");
    const name = pathname.startsWith("/courts/") ? courts.find(c => c.id === pathname.split("/")[2])?.name : {
      "/": "Find your next game",
      "/courts": "Court directory",
      "/map": "Explore the map",
      "/saved": "Saved courts",
      "/plan": "Plan a game",
      "/compare": "Compare courts",
      "/about": "About"
    }[pathname];
    document.title = (name || "Page not found") + " · Pickle Batangas";
  }, [pathname]);
  useEffect(() => {
    const onKey = e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if (e.key === "/" && !typing || (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearching(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return <>
    <a className="skip" href="#content">Skip to content</a>
    <header className="topbar"><Link to="/" className="brand"><BallMark /><span>pickle<span className="brand-place">batangas</span></span></Link><div className="topbar-right"><nav aria-label="Main navigation">{TABS.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === "/"}><Icon size={19} aria-hidden="true" /><span>{label}</span>{label === "Saved" && ids.length > 0 && <b className="count">{ids.length}</b>}</NavLink>)}</nav><button type="button" className="icon-btn search-trigger" aria-label="Search courts" title="Search (Ctrl+K)" onClick={() => setSearching(true)}><Search size={19} /><kbd>⌘ K</kbd></button><button type="button" className="icon-btn theme-toggle" aria-label={"Switch to " + (theme === "dark" ? "light" : "dark") + " mode"} title={"Switch to " + (theme === "dark" ? "light" : "dark") + " mode"} onClick={toggleTheme}>{theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}</button></div></header>
    <main id="content"><ErrorBoundary resetKey={pathname}><div className="route" key={pathname}><Suspense fallback={<div className="loading" role="status" aria-label="Loading page"><i /></div>}><Routes>
      <Route path="/" element={<Landing />} /><Route path="/explore" element={<Navigate to="/" replace />} /><Route path="/courts" element={<Courts />} /><Route path="/courts/:id" element={<CourtDetail />} /><Route path="/map" element={<MapPage />} /><Route path="/plan" element={<Plan />} /><Route path="/saved" element={<Saved />} /><Route path="/about" element={<About />} /><Route path="/compare" element={<Compare />} /><Route path="*" element={<NotFound />} />
    </Routes></Suspense></div></ErrorBoundary>
    {pathname !== "/map" && <footer className="footer"><div className="footer-main"><div><Link to="/" className="brand"><BallMark /><span>pickle<span className="brand-place">batangas</span></span></Link><p>Find your court. Bring your people.<br />Make time for a good game.</p></div><div className="footer-column"><b>EXPLORE</b><Link to="/courts">Court directory</Link><Link to="/map">Explore the map</Link><Link to="/saved">Your saved courts</Link></div><div className="footer-column"><b>GET INVOLVED</b><Link to="/plan">Plan a game</Link><Link to="/about">About the project</Link><Link to="/about#contact">Suggest a court<ArrowUpRight size={13} /></Link>{CONTACT_EMAIL && <a href={"mailto:" + CONTACT_EMAIL}>Report a correction</a>}</div><div className="footer-note"><span>BUILT FOR BATANGAS</span><p>Local places.<br />More possibilities.</p><a href={DEVELOPER.github} target="_blank" rel="noreferrer">A project by {DEVELOPER.name}<ArrowUpRight size={13} /></a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Pickle Batangas</span><span>Hours and details may change. Confirm with the venue before visiting.</span><span>Made for the love of the game. ↗</span></div></footer>}
    </main>
    {compare.ids.length > 0 && pathname !== "/compare" && pathname !== "/map" && <div className={"compare-tray" + (pathname.startsWith("/courts/") ? " visit-compare" : "")}><GitCompareArrows size={18} /><span>{compare.ids.length} <span className="compare-tray-label">court{compare.ids.length > 1 ? "s" : ""} selected</span></span><Link to="/compare" className="btn primary">Compare<ArrowUpRight size={15} /></Link><button className="clear" aria-label="Clear comparison" onClick={compare.clear}><X size={15} /></button></div>}
    {searching && <QuickSearch onClose={() => setSearching(false)} />}<GeoDialog /><Toaster /><ScrollTop />
  </>;
}
