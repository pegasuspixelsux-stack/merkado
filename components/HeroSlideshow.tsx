"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { HeroConfig, Slide } from "@/types/hero";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const DESKTOP = "(min-width: 768px)"; // matches the nav's md breakpoint

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

// "desktop" or "mobile" on the client. On the server the width is unknown (null), so no photo is
// requested until the page hydrates. That way a phone never downloads the desktop image first.
function useDevice(): "desktop" | "mobile" | null {
  return useSyncExternalStore(
    subscribeDesktop,
    () => (window.matchMedia(DESKTOP).matches ? "desktop" : "mobile"),
    () => null,
  );
}

// One slide image. A broken link hides itself so the solid background shows instead of a broken icon.
function SlideImage({ slide, active, index, count, first }: {
  slide: Slide;
  active: boolean;
  index: number;
  count: number;
  first: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}`}
      aria-hidden={!active}
      className={`absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Admin-supplied images can come from anywhere (links or uploads), so a plain <img> is used. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.imageUrl}
        alt={slide.altText ?? ""}
        loading={first ? "eager" : "lazy"}
        fetchPriority={first ? "high" : "auto"}
        decoding="async"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

const arrowBtn =
  "absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50 active:scale-95 sm:h-11 sm:w-11";

// A full-width, square hero driven by HeroConfig. It crossfades between slides, optionally shows
// the heading and supporting text over them, and is a size container, so the type scales with the
// hero's own width (cqw units) and always fits. On wide screens the height is capped at one
// viewport. The nav floats transparent over its top edge.
export default function HeroSlideshow({ config }: { config: HeroConfig }) {
  const { desktopSlides, mobileSlides, showTextOverlay, heading, subtext, enableAutoplay, autoplayIntervalMs } = config;

  // Phones use the mobile set and wider screens the desktop set. If the chosen set is empty, the
  // other one fills in so the hero is never bare just because one side was left unset.
  const device = useDevice();
  const preferred = device === "mobile" ? mobileSlides : desktopSlides;
  const fallback = device === "mobile" ? desktopSlides : mobileSlides;
  const slides = device === null ? [] : preferred.length ? preferred : fallback;
  const count = slides.length;

  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [engaged, setEngaged] = useState(false); // pointer over or focus inside: don't move it

  // Slides can be removed in the admin while this is mounted, so keep the index in range.
  const current = count ? index % count : 0;
  const autoplaying = enableAutoplay && count > 1 && !reducedMotion && !userPaused && !engaged;

  // The timer restarts whenever `current` changes, so manual navigation resets the countdown.
  useEffect(() => {
    if (!autoplaying) return;
    const t = setTimeout(() => setIndex((current + 1) % count), autoplayIntervalMs);
    return () => clearTimeout(t);
  }, [autoplaying, current, count, autoplayIntervalMs]);

  const go = (n: number) => setIndex(((n % count) + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-labelledby="hero-title"
      onPointerEnter={(e) => e.pointerType === "mouse" && setEngaged(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={() => setEngaged(false)}
      className="@container relative aspect-square max-h-[100dvh] w-full overflow-hidden bg-zinc-900"
    >
      {/* With no slides this stays a quiet solid background. */}
      {count === 0 && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_30%,rgb(255_255_255/0.10),transparent_70%)]"
        />
      )}

      <div className="absolute inset-0" aria-live={autoplaying ? "off" : "polite"}>
        {slides.map((slide, i) => (
          <SlideImage
            key={slide.id}
            slide={slide}
            active={i === current}
            index={i}
            count={count}
            first={i === 0}
          />
        ))}
      </div>

      {/* Scrim. Darker and even when text sits on top. Photo-only heroes get just a light touch for the nav and dots, so artwork keeps its colours. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 ${
          showTextOverlay
            ? "bg-gradient-to-b from-black/55 via-black/45 to-black/65"
            : "bg-gradient-to-b from-black/30 via-transparent to-black/15"
        }`}
      />

      {showTextOverlay ? (
        <div className="pointer-events-none relative flex h-full flex-col items-center justify-center p-[clamp(1rem,5cqw,3rem)] text-center">
          <h1
            id="hero-title"
            className="text-balance font-semibold leading-[1.02] tracking-tight text-white text-[clamp(1.75rem,8cqw,5rem)] [text-shadow:0_2px_24px_rgb(0_0_0/0.45)]"
          >
            {heading}
          </h1>
          {subtext && (
            <p className="mt-[clamp(0.375rem,1.5cqw,1rem)] max-w-[34ch] text-pretty leading-snug text-white/85 text-[clamp(0.8125rem,2.4cqw,1.25rem)] [text-shadow:0_1px_12px_rgb(0_0_0/0.4)]">
              {subtext}
            </p>
          )}
        </div>
      ) : (
        // Text is off, but the page still needs a heading for screen readers and search engines.
        <h1 id="hero-title" className="sr-only">
          {heading || "Merkado catalog"}
        </h1>
      )}

      {count > 1 && (
        <>
          <button type="button" onClick={() => go(current - 1)} aria-label="Previous slide" className={`${arrowBtn} left-3 sm:left-5`}>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => go(current + 1)} aria-label="Next slide" className={`${arrowBtn} right-3 sm:right-5`}>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center sm:bottom-5">
            <div className="flex items-center rounded-full bg-black/25 px-1.5 backdrop-blur-md">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === current ? "true" : undefined}
                  className="grid h-7 w-6 place-items-center"
                >
                  <span
                    className={`block h-2 rounded-full bg-white transition-all duration-300 motion-reduce:transition-none ${
                      i === current ? "w-5 opacity-100" : "w-2 opacity-50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {enableAutoplay && !reducedMotion && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
              className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50 sm:bottom-5 sm:right-5"
            >
              {userPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
            </button>
          )}
        </>
      )}
    </section>
  );
}
