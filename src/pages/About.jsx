import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Navigation, Ban, Hand, Repeat, Trophy, Mail, Copy, Check, Send } from "lucide-react";
import courts from "../data/courts.json";
import BackButton from "../components/BackButton.jsx";
import PageHead from "../components/PageHead.jsx";
import useCountUp from "../useCountUp.js";
import { FacebookIcon, GithubIcon } from "../icons.jsx";
import { CONTACT_EMAIL, FACEBOOK_URL, DEVELOPER } from "../config.js";

const STEPS = [
  [Search, "Search", "Find a court by name, town, or what's open right now."],
  [MapPin, "Explore", "See every court on the map and tap a pin for details."],
  [Navigation, "Go play", "Get directions, call ahead, or share the court with your group."],
];
const TIPS = [
  [Ban, "The kitchen", "The 7-foot zone next to the net is the non-volley zone. No volleys while you stand in it."],
  [Hand, "Underhand serve", "Serve underhand, diagonally across the court, and clear the kitchen."],
  [Repeat, "Two bounces", "The serve and its return must each bounce once before anyone volleys."],
  [Trophy, "Play to 11", "Games go to 11 points. You need to win by 2."],
];
const FAQ = [
  ["How current is the information?", "Hours and contacts come from public pages and can change. Please call or check the court's page before you go, and tell us if something is wrong."],
  ["Is it free to use?", "Yes. Pickle Batangas is free for players. It does not take bookings or payments."],
  ["How do I list my court?", "Send us the court name, town, hours and a contact. Use the form below and it will be added after a quick check."],
];

function SuggestForm() {
  const [v, setV] = useState({ name: "", town: "", notes: "" });
  const [copied, setCopied] = useState(false);
  const message = `New court suggestion for Pickle Batangas\n\nCourt name: ${v.name}\nTown: ${v.town}\nDetails (hours, phone, Facebook page): ${v.notes}`;
  const field = (key) => ({ value: v[key], onChange: (e) => setV({ ...v, [key]: e.target.value }) });
  return (
    <div className="suggest">
      <h3>Suggest a court or a correction</h3>
      <label>Court name<input {...field("name")} placeholder="e.g. Sunrise Pickleball" /></label>
      <label>Town<input {...field("town")} placeholder="e.g. Lipa City" /></label>
      <label>Details<textarea rows="3" {...field("notes")} placeholder="Hours, phone, Facebook page, or what needs fixing" /></label>
      <div className="row">
        {CONTACT_EMAIL && <a className="btn primary" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Pickle Batangas court")}&body=${encodeURIComponent(message)}`}><Send size={18} aria-hidden="true" />Send by email</a>}
        <button type="button" className="btn ghost dark" onClick={async () => { await navigator.clipboard.writeText(message); setCopied(true); }}>
          {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}{copied ? "Copied" : "Copy message"}
        </button>
      </div>
      {!CONTACT_EMAIL && <p className="muted">Copy the message and send it to the developer using one of the links on this page.</p>}
    </div>
  );
}

export default function About() {
  const nCourts = useCountUp(courts.length), nTowns = useCountUp(new Set(courts.map((c) => c.municipality)).size);
  const contacts = [
    CONTACT_EMAIL && { Icon: Mail, label: "Email", sub: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    FACEBOOK_URL && { Icon: FacebookIcon, label: "Facebook", sub: "Send a message", href: FACEBOOK_URL },
    DEVELOPER.github && { Icon: GithubIcon, label: "GitHub", sub: "@" + DEVELOPER.github.split("/").pop(), href: DEVELOPER.github },
  ].filter(Boolean);

  return (
    <>
      <PageHead eyebrow="About" title="Made for Batangas players">
        <p className="muted lede-light">One place to find a pickleball court near you, check if it's open, and get there.</p>
        <dl className="stats"><div><dt>Courts</dt><dd>{nCourts}</dd></div><div><dt>Cities and towns</dt><dd>{nTowns}</dd></div></dl>
        <BackButton fallback="/" label="Home" />
      </PageHead>

      <div className="page pull about">
        <div className="steps">
          {STEPS.map(([Icon, title, text], i) => (
            <div className="step reveal" key={title}><span className="step-n">{i + 1}</span><span className="step-icon"><Icon size={22} aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></div>
          ))}
        </div>

        <section className="about-sec reveal">
          <p className="eyebrow">New to the game?</p><h2>Pickleball in 60 seconds</h2>
          <div className="tips">
            {TIPS.map(([Icon, title, text]) => <div className="tip" key={title}><Icon size={22} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></div>)}
          </div>
        </section>

        <section className="about-sec reveal">
          <p className="eyebrow">Good to know</p><h2>Questions</h2>
          <div className="faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </section>

        <section className="about-sec contact reveal" id="contact">
          <div><p className="eyebrow">Get in touch</p><h2>Help us keep it accurate</h2><SuggestForm /></div>
          <div className="dev">
            <div className="dev-card">
              <span className="avatar" aria-hidden="true">{DEVELOPER.name.charAt(0)}</span>
              <h3>{DEVELOPER.name}</h3><p className="muted">{DEVELOPER.role}</p>
              <div className="contacts">
                {contacts.map(({ Icon, label, sub, href }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" className="contact-link"><Icon size={20} /><span><b>{label}</b><small>{sub}</small></span></a>
                ))}
              </div>
            </div>
            <Link className="btn" to="/courts">Browse courts</Link>
          </div>
        </section>
      </div>
    </>
  );
}
