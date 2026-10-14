import type { HeroConfig, Slide } from "@/types/hero";
import type { HeroBackend } from "./backend";
import { DEFAULT_HERO_CONFIG, MAX_COLOR_OPACITY, MAX_DARKNESS, MAX_SLIDES } from "./defaults";

const KEY = "merkado:hero-config:v1";
const listeners = new Set<() => void>();
let cache: HeroConfig | null = null;

function sanitizeSlide(v: unknown): Slide | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.imageUrl !== "string" || !o.imageUrl) return null;
  return {
    id: o.id,
    imageUrl: o.imageUrl,
    ...(typeof o.altText === "string" && o.altText ? { altText: o.altText } : {}),
  };
}

const clampNumber = (v: unknown, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(0, Math.round(v))) : fallback;

// Anything missing or malformed falls back to the default for that field.
function sanitize(raw: unknown): HeroConfig {
  const d = DEFAULT_HERO_CONFIG;
  if (!raw || typeof raw !== "object") return d;
  const o = raw as Record<string, unknown>;
  const list = (v: unknown, fallback: Slide[]) =>
    Array.isArray(v)
      ? v.map(sanitizeSlide).filter((s): s is Slide => s !== null).slice(0, MAX_SLIDES)
      : fallback;

  // Configs saved before the desktop/mobile split have one `slides` list. It becomes the desktop
  // set, and mobile starts empty so it keeps showing the same photos until a mobile set is added.
  const legacy = Array.isArray(o.slides);
  const desktopSlides = list(legacy && o.desktopSlides === undefined ? o.slides : o.desktopSlides, d.desktopSlides);
  const mobileSlides = legacy && o.mobileSlides === undefined ? [] : list(o.mobileSlides, d.mobileSlides);
  const interval = o.autoplayIntervalMs;
  return {
    showTextOverlay: typeof o.showTextOverlay === "boolean" ? o.showTextOverlay : d.showTextOverlay,
    heading: typeof o.heading === "string" ? o.heading : d.heading,
    subtext: typeof o.subtext === "string" ? o.subtext : d.subtext,
    desktopSlides,
    mobileSlides,
    autoplayIntervalMs:
      typeof interval === "number" && interval >= 2000 && interval <= 30000 ? interval : d.autoplayIntervalMs,
    enableAutoplay: typeof o.enableAutoplay === "boolean" ? o.enableAutoplay : d.enableAutoplay,
    showNavTitle: typeof o.showNavTitle === "boolean" ? o.showNavTitle : d.showNavTitle,
    overlayDarkness: clampNumber(o.overlayDarkness, MAX_DARKNESS, d.overlayDarkness),
    overlayColor:
      typeof o.overlayColor === "string" && /^#[0-9a-fA-F]{6}$/.test(o.overlayColor) ? o.overlayColor : d.overlayColor,
    overlayColorOpacity: clampNumber(o.overlayColorOpacity, MAX_COLOR_OPACITY, d.overlayColorOpacity),
  };
}

// The snapshot must be referentially stable between changes, so it is cached.
function load(): HeroConfig {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? sanitize(JSON.parse(raw)) : DEFAULT_HERO_CONFIG;
  } catch {
    cache = DEFAULT_HERO_CONFIG;
  }
  return cache;
}

// Keeps other open tabs in sync.
function onStorage(e: StorageEvent) {
  if (e.key === KEY || e.key === null) {
    cache = null;
    listeners.forEach((l) => l());
  }
}

export const localHeroBackend: HeroBackend = {
  subscribe(onChange) {
    listeners.add(onChange);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onChange);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot: load,
  getServerSnapshot: () => DEFAULT_HERO_CONFIG,

  async save(config) {
    // Write first. If storage is full or blocked this throws and the live config is untouched,
    // so the page never shows something that would be gone after a reload.
    window.localStorage.setItem(KEY, JSON.stringify(config));
    cache = config;
    listeners.forEach((l) => l());
  },
};
