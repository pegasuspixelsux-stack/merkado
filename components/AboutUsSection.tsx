"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ChevronDown, Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { addressLine, storeInfo } from "@/config/storeInfo";
import { whatsappLink } from "@/lib/format";
import { OPEN_ABOUT_EVENT } from "@/components/OpenAboutLink";
import PastaImage from "@/components/catalog/PastaImage";

// Lets a link like /#about (the footer's "About us") open the section.
function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const hashWantsAbout = () => window.location.hash === "#about";

const badge =
  "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-chestnut/10 text-chestnut dark:bg-white/10 dark:text-white";

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

  const { hours, pickup, delivery } = storeInfo;
  const service = [pickup && "Pickup", delivery && "Delivery"].filter(Boolean).join(" and ");

  return (
    <section
      id="about"
      aria-labelledby="about-toggle"
      className="mt-12 overflow-hidden rounded-[14px] border border-walnut/15 bg-cream/70 dark:border-white/10 dark:bg-zinc-900/50"
    >
      <h2 className="m-0">
        <button
          id="about-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="about-panel"
          onClick={() => setTouched(!open)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium text-walnut transition-colors hover:bg-walnut/5 dark:text-white dark:hover:bg-white/5"
        >
          Learn more about our story and location
          <ChevronDown
            className={`h-5 w-5 shrink-0 transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
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
          <div className="grid gap-6 border-t border-walnut/15 p-5 sm:p-6 md:grid-cols-2 md:gap-8 dark:border-white/10">
            <PastaImage
              url={storeInfo.about.imageUrl}
              alt={storeInfo.about.imageAlt}
              className="aspect-[4/3] w-full rounded-xl md:aspect-auto md:h-full md:min-h-72"
            />

            <div>
              <h3 className="text-balance text-2xl font-semibold tracking-tight text-walnut dark:text-white">
                Artisanal Fresh Pasta Since {storeInfo.foundedYear}
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted dark:text-zinc-400">
                {storeInfo.about.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>

              <ul className="mt-5 space-y-3">
                <li className="flex items-center gap-3">
                  <span className={badge}><MapPin className="h-5 w-5" aria-hidden="true" /></span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted dark:text-zinc-400">Address</p>
                    <p className="text-sm font-medium text-walnut dark:text-white">{addressLine()}</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className={badge}><Phone className="h-5 w-5" aria-hidden="true" /></span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted dark:text-zinc-400">Phone and WhatsApp</p>
                    <p className="text-sm font-medium text-walnut dark:text-white">
                      <a href={`tel:${storeInfo.phone.tel}`} className="hover:underline">{storeInfo.phone.display}</a>
                      <span className="text-muted dark:text-zinc-500"> / </span>
                      <a
                        href={whatsappLink("Hola! Quiero hacer una consulta.")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        WhatsApp
                      </a>
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className={badge}><Clock className="h-5 w-5" aria-hidden="true" /></span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted dark:text-zinc-400">{service} hours</p>
                    {hours.map((h) => (
                      <p key={h.days} className="text-sm font-medium text-walnut dark:text-white">
                        {h.days}: <span className="font-normal text-muted dark:text-zinc-400">{h.times}</span>
                      </p>
                    ))}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
