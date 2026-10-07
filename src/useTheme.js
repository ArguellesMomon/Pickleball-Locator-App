import { useEffect, useState } from "react";
export default function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#111c18" : "#f8f9f5");
    try {
      localStorage.setItem("pickle-theme", theme);
    } catch {}
  }, [theme]);
  return {
    theme,
    toggleTheme: () => setTheme(t => t === "dark" ? "light" : "dark")
  };
}
