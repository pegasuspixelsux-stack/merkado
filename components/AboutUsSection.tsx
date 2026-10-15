"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { storeInfo } from "@/config/storeInfo";
import { OPEN_ABOUT_EVENT } from "@/components/OpenAboutLink";
import PastaImage from "@/components/catalog/PastaImage";

// Lets a link like /#about (the footer's "About us") open the section.
function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const hashWantsAbout = () => window.location.hash === "#about";

// A full-width band that sits directly on top of the footer. It tells the story only: the address,
// phone, WhatsApp and hours already live in the footer, so they are not repeated here.
export default function AboutUsSection() {
  // Closed by default so the menu comes first. `touched` records the visitor's own choice; until
  // they make one, a #about link in the URL decides.
  const hashRequested = useSyncExternalStore(subscribeHash, hashWantsAbout, () => false);
  const [touched, setTouched] = useState<boolean | null>(null);
  const open = touched ?? hashRequested;

  // Following a fresh #about link, or the footer's "About us" link, opens the section again even
  // if the visitor had closed it.
  useEffect(() => {
    const reset = () => setTouched(null);
    const openNow = () => setTouched(true);
    window.addEventListener("hashchange", reset);
    window.addEventListener(OPEN_ABOUT_EVENT, openNow);
    return () => {
      window.removeEventListener("hashchange", reset);
      window.removeEventListener(OPEN_ABOUT_EVENT, openNow);
    };
  }, []);

  return (
    <section
      id="about"
      aria-labelledby="about-toggle"
      className="border-t border-walnut/15 bg-cream/70 dark:border-white/10 dark:bg-zinc-900/50"
    >
      <h2 className="m-0">
        <button
          id="about-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="about-panel"
          onClick={() => setTouched(!open)}
          className="w-full text-left text-base font-medium text-walnut transition-colors hover:bg-walnut/5 dark:text-white dark:hover:bg-white/5"
        >
          <span className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
            Learn more about our story
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </span>
        </button>
      </h2>

      {/* Animates open and closed with a grid-rows transition, which needs no measured heights.
          `inert` keeps the collapsed content out of the tab order and away from screen readers. */}
      <div
        id="about-panel"
        role="region"
        aria-labelledby="about-toggle"
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-6 border-t border-walnut/15 px-6 py-8 md:grid-cols-2 md:items-center md:gap-10 md:py-10 dark:border-white/10">
            <PastaImage
              url={storeInfo.about.imageUrl}
              alt={storeInfo.about.imageAlt}
              className="aspect-[4/3] w-full rounded-[14px]"
            />

            <div>
              <h3 className="text-balance text-2xl font-semibold tracking-tight text-walnut md:text-3xl dark:text-white">
                Artisanal Fresh Pasta Since {storeInfo.foundedYear}
              </h3>
              <div className="mt-4 space-y-3 text-base leading-relaxed text-muted dark:text-zinc-400">
                {storeInfo.about.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
