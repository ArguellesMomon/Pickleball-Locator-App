import { useEffect } from "react";
// Keep keyboard focus inside a modal and restore it to its trigger on dismissal.
export default function useDialog(ref, onClose, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = ref.current;
    const focusable = () => [...(root?.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select,textarea,[tabindex="0"]') || [])].filter(el => el.getClientRects().length > 0);
    (root?.querySelector("[data-autofocus]") || focusable()[0] || root)?.focus();
    const key = e => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab") {
        const all = focusable();
        const first = all[0],
          last = all.at(-1);
        if (!first) {
          e.preventDefault();
          root?.focus();
        } else if (e.shiftKey && (document.activeElement === first || document.activeElement === root)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [enabled]);
}
