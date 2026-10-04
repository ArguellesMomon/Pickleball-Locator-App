import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, NavLink, Link, useLocation, useNavigationType } from "react-router-dom";
import { Compass, LayoutGrid, Map as MapIcon, CalendarDays, Heart, Search } from "lucide-react";
import Landing from "./pages/Landing.jsx";
import Home from "./pages/Home.jsx";
import Courts from "./pages/Courts.jsx";
import Saved from "./pages/Saved.jsx";
import NotFound from "./pages/NotFound.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import QuickSearch from "./components/QuickSearch.jsx";
import Toaster from "./components/Toaster.jsx";
import ScrollTop from "./components/ScrollTop.jsx";
import useSaved from "./useSaved.js";
import { CONTACT_EMAIL } from "./config.js";

// Heavier pages load on demand, so the first screen opens fast
const MapPage = lazy(() => import("./pages/MapPage.jsx"));
const CourtDetail = lazy(() => import("./pages/CourtDetail.jsx"));
const Plan = lazy(() => import("./pages/Plan.jsx"));
const About = lazy(() => import("./pages/About.jsx"));

// [path, label, icon]: pill links on desktop, floating icon dock on phones
const TABS = [["/explore", "Explore", Compass], ["/courts", "Courts", LayoutGrid], ["/map", "Map", MapIcon], ["/plan", "Plan", CalendarDays], ["/saved", "Saved", Heart]];

const BallMark = () => (
  <svg className="mark" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#d9f03d" />
    {[[8, 8], [14, 7], [17, 12], [7, 14], [12, 12], [13, 17]].map(([x, y]) => <circle key={x + "" + y} cx={x} cy={y} r="1.3" fill="#0b1b2b" />)}
  </svg>
);
const Loading = () => <div className="loading" role="status" aria-label="Loading"><i /></div>;

export default function App() {
  const { pathname, key, hash } = useLocation();
  const navType = useNavigationType();
  const { ids } = useSaved();
  const [searching, setSearching] = useState(false);

  // Back/forward returns you to where you were; new pages start at the top; #links scroll to their section
  useEffect(() => {
    const saved = sessionStorage.getItem(`scroll:${key}`);
    let poll;
    if (navType === "POP" && saved !== null) window.scrollTo(0, Number(saved));
    else if (navType === "REPLACE") sessionStorage.setItem(`scroll:${key}`, String(window.scrollY));
    else if (hash) {
      let tries = 0;
      poll = setInterval(() => { const el = document.querySelector(hash); if (el || ++tries > 20) { clearInterval(poll); el?.scrollIntoView({ behavior: "smooth", block: "start" }); } }, 100);
    } else window.scrollTo(0, 0);
    const save = () => sessionStorage.setItem(`scroll:${key}`, String(window.scrollY));
    window.addEventListener("scroll", save, { passive: true });
    return () => { clearInterval(poll); window.removeEventListener("scroll", save); };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // The map page is full-screen on phones; other pages let the bottom dock slide away while scrolling down
  useEffect(() => {
    document.body.classList.toggle("on-map", pathname === "/map");
    document.body.classList.remove("dock-hidden");
  }, [pathname]);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 10) return;
      document.body.classList.toggle("dock-hidden", y > last && y > 120);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Press / or Ctrl+K anywhere to jump to a court. Also warm up the heavy pages once the app is idle.
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); setSearching(true); }
    };
    document.addEventListener("keydown", onKey);
    const warm = setTimeout(() => { import("./pages/MapPage.jsx"); import("./pages/CourtDetail.jsx"); }, 3000);
    return () => { document.removeEventListener("keydown", onKey); clearTimeout(warm); };
  }, []);

  return (
    <>
      <a className="skip" href="#content">Skip to content</a>
      <header className="topbar">
        <Link to="/" className="brand"><BallMark />Pickle Batangas</Link>
        <div className="topbar-right">
          <nav aria-label="Main">
            {TABS.map(([to, label, Icon]) => (
              <NavLink key={to} to={to}>
                <Icon size={20} aria-hidden="true" /><span>{label}</span>
                {label === "Saved" && ids.length > 0 && <b className="count">{ids.length}</b>}
              </NavLink>
            ))}
          </nav>
          <button type="button" className="icon-btn" aria-label="Search courts" title="Search (press /)" onClick={() => setSearching(true)}><Search size={20} /></button>
        </div>
      </header>
      <main id="content">
        <ErrorBoundary resetKey={pathname}>
          <div className="route" key={pathname}>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/explore" element={<Home />} />
                <Route path="/courts" element={<Courts />} />
                <Route path="/courts/:id" element={<CourtDetail />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/plan" element={<Plan />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </ErrorBoundary>
        {pathname !== "/map" && (
          <footer className="footer">
            <div className="footer-in">
              <Link to="/" className="brand"><BallMark />Pickle Batangas</Link>
              <p>Details can change. Please confirm with the court before you go.</p>
              <div className="footer-links">
                <Link to="/plan">Plan a game</Link>
                <Link to="/about">About</Link>
                {CONTACT_EMAIL && <a href={`mailto:${CONTACT_EMAIL}?subject=Pickle%20Batangas%20correction`}>Report a correction</a>}
              </div>
            </div>
          </footer>
        )}
      </main>
      {searching && <QuickSearch onClose={() => setSearching(false)} />}
      <Toaster />
      <ScrollTop />
    </>
  );
}
