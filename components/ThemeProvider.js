"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  // "system" | "light" | "dark"
  const [preference, setPreference] = useState("system");
  const [resolved, setResolved] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme-preference");
    if (stored) setPreference(stored);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    function apply() {
      const effective =
        preference === "system"
          ? mql.matches
            ? "dark"
            : "light"
          : preference;
      setResolved(effective);
      document.documentElement.classList.toggle("dark", effective === "dark");
    }

    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [preference]);

  function setTheme(next) {
    setPreference(next);
    localStorage.setItem("theme-preference", next);
  }

  return (
    <ThemeContext.Provider value={{ preference, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
