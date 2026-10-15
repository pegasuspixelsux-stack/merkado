"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useHeroConfig } from "@/hooks/useHeroConfig";
import OpenAboutLink from "@/components/OpenAboutLink";
import { navLinks } from "@/config/navLinks";
import { Menu, Search, X } from "lucide-react";

// The links are shared with the footer (config/navLinks.ts). "Sobre nosotros" also opens the About
// band. The admin login lives in the footer.
const links = navLinks;

const iconBtn =
  "grid h-10 w-10 place-items-center rounded-full text-walnut transition-colors hover:bg-walnut/5 dark:text-zinc-300 dark:hover:bg-white/10";
const field =
  "w-full rounded-full border border-walnut/15 bg-walnut/[0.05] py-2 pl-10 pr-4 text-sm text-walnut placeholder:text-zinc-500 focus:border-walnut/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/30";

type Panel = "menu" | "search" | null;

export default function Navbar() {
  // The site name in the bar can be switched off from the admin Hero tab.
  const { config } = useHeroConfig();
  const urlQuery = useSearchParams().get("q") ?? "";
  const [panel, setPanel] = useState<Panel>(null);

  // False while the page is at the top, where the bar is fully transparent.
  const [scrolled, setScrolled] = useState(false);

  // The input keeps its own text so typing never lags, and re-syncs when the URL changes
  // from elsewhere (back button, "Clear filters", the Home link).
  const [query, setQuery] = useState(urlQuery);
  const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);
  if (urlQuery !== seenUrlQuery) {
    setSeenUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  // A 1px sentinel at the very top of the page tells us when the visitor has scrolled. Using an
  // IntersectionObserver avoids a scroll listener that would run on every frame.
  useEffect(() => {
    const sentinel = document.getElementById("top-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Frosted once scrolled, or whenever a mobile panel is open (so its contents stay readable).
  const solid = scrolled || panel !== null;

  // Close the open mobile panel with Escape.
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  // The catalog filters live as you type. The query goes into the URL, which the grid reads.
  function onType(value: string) {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set("q", value);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setPanel(null);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const searchField = (autoFocus: boolean) => (
    <form onSubmit={submit} role="search" className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => onType(e.target.value)}
        placeholder="Buscá pastas, salsas, quesos"
        aria-label="Buscar en el catálogo"
        autoFocus={autoFocus}
        className={`${field} [&::-webkit-search-cancel-button]:appearance-none`}
      />
    </form>
  );

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 motion-reduce:transition-none ${
        solid
          ? "glass border-walnut/15 bg-background/50 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-950/50"
          : "border-transparent bg-transparent"
      }`}
    >
      {/* Mobile: burger left, brand centered, search right. Desktop: brand, links, search. */}
      <nav
        aria-label="Principal"
        className={`mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 md:h-14`}
      >
        <div className="col-start-1 row-start-1 flex justify-start md:hidden">
          <button
            type="button"
            onClick={() => setPanel((p) => (p === "menu" ? null : "menu"))}
            aria-label={panel === "menu" ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={panel === "menu"}
            aria-controls="mobile-menu"
            className={`${iconBtn} -ml-2`}
          >
            {panel === "menu" ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {config.showNavTitle && (
          <Link
            href="/"
            className="col-start-2 row-start-1 justify-self-center text-lg font-bold tracking-tight text-walnut md:col-start-1 md:justify-self-start dark:text-white"
          >
            Merkado
          </Link>
        )}

        <ul className="row-start-1 hidden items-center gap-8 md:col-start-2 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              {l.opensAbout ? (
                <OpenAboutLink className="text-sm text-muted transition-colors hover:text-walnut dark:text-zinc-400 dark:hover:text-white">
                  {l.label}
                </OpenAboutLink>
              ) : (
                <Link
                  href={l.href}
                  className="text-sm text-muted transition-colors hover:text-walnut dark:text-zinc-400 dark:hover:text-white"
                >
                  {l.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="col-start-3 row-start-1 flex justify-end">
          <div className="hidden w-64 md:block">{searchField(false)}</div>
          <button
            type="button"
            onClick={() => setPanel((p) => (p === "search" ? null : "search"))}
            aria-label={panel === "search" ? "Cerrar búsqueda" : "Abrir búsqueda"}
            aria-expanded={panel === "search"}
            aria-controls="mobile-search"
            className={`${iconBtn} -mr-2 md:hidden`}
          >
            {panel === "search" ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {panel === "menu" && (
        <div id="mobile-menu" className="border-t border-walnut/15 bg-background/90 px-6 pb-4 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90 md:hidden">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                {l.opensAbout ? (
                  <OpenAboutLink
                    onClick={() => setPanel(null)}
                    className="block py-3 text-base text-walnut transition-colors hover:text-walnut dark:text-zinc-300 dark:hover:text-white"
                  >
                    {l.label}
                  </OpenAboutLink>
                ) : (
                  <Link
                    href={l.href}
                    onClick={() => setPanel(null)}
                    className="block py-3 text-base text-walnut transition-colors hover:text-walnut dark:text-zinc-300 dark:hover:text-white"
                  >
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {panel === "search" && (
        <div id="mobile-search" className="border-t border-walnut/15 bg-background/90 px-6 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90 md:hidden">
          {searchField(true)}
        </div>
      )}
    </header>
  );
}
