"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

// The <html> class is the source of truth. Subscribe to it so the buttons stay in sync.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const getTheme = (): Theme | null =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

// No theme is known on the server.
const getServerTheme = (): Theme | null => null;

// The active highlight is pure CSS (dark: variants), so it is correct on first paint.
// The synced state only drives aria-pressed.
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  function apply(next: Theme) {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked; the choice still applies for this visit.
    }
  }

  const base =
    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors";

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex rounded-full border border-walnut/15 bg-walnut/[0.05] p-0.5 dark:border-white/10 dark:bg-white/5"
    >
      <button
        type="button"
        onClick={() => apply("light")}
        aria-pressed={theme === "light"}
        className={`${base} bg-cream text-walnut shadow-sm dark:bg-transparent dark:text-zinc-500 dark:shadow-none dark:hover:text-zinc-200`}
      >
        <Sun className="h-3.5 w-3.5" aria-hidden="true" />
        Light
      </button>
      <button
        type="button"
        onClick={() => apply("dark")}
        aria-pressed={theme === "dark"}
        className={`${base} text-muted hover:text-walnut dark:bg-white/10 dark:text-white dark:hover:text-white`}
      >
        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
        Dark
      </button>
    </div>
  );
}
