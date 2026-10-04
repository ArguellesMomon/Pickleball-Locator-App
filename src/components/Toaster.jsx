import { useState, useEffect } from "react";

// Small message at the bottom of the screen, with an optional Undo. Trigger with showToast() from anywhere.
export function showToast(text, undo) { window.dispatchEvent(new CustomEvent("toast", { detail: { text, undo } })); }

export default function Toaster() {
  const [t, setT] = useState(null);
  useEffect(() => {
    let timer;
    const on = (e) => { setT({ ...e.detail, id: Date.now() }); clearTimeout(timer); timer = setTimeout(() => setT(null), 4000); };
    window.addEventListener("toast", on);
    return () => { window.removeEventListener("toast", on); clearTimeout(timer); };
  }, []);
  if (!t) return null;
  return (
    <div className="toast" role="status" key={t.id}>
      <span>{t.text}</span>
      {t.undo && <button type="button" onClick={() => { t.undo(); setT(null); }}>Undo</button>}
    </div>
  );
}
