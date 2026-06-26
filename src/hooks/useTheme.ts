import { useEffect } from "react";
import type { ThemeMode } from "../data/types";

/**
 * Applies the chosen theme to <html>. In "auto" mode it follows the OS setting
 * and live-updates when the system preference changes.
 */
export function useTheme(mode: ThemeMode) {
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const dark = mode === "dark" || (mode === "auto" && mq.matches);
      root.classList.toggle("dark", dark);
    };

    apply();
    if (mode === "auto") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [mode]);
}
