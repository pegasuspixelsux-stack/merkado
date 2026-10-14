"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Link2, Trash2 } from "lucide-react";
import type { HeroConfig, Slide } from "@/types/hero";
import { heroBackend } from "@/lib/hero";
import { INTERVAL_OPTIONS_MS, MAX_SLIDES } from "@/lib/hero/defaults";
import { fileToDataUrl } from "@/lib/hero/image";
import { useHeroConfig } from "@/hooks/useHeroConfig";
import PastaImage from "@/components/catalog/PastaImage";
import Modal from "./Modal";
import Switch from "./Switch";

const card =
  "rounded-[14px] border border-walnut/15 bg-cream/70 p-5 sm:p-6 dark:border-white/10 dark:bg-zinc-900/50";
const input =
  "w-full rounded-xl border border-walnut/15 bg-cream px-3.5 py-2.5 text-sm text-walnut placeholder:text-zinc-500 focus:border-walnut/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:focus:border-white/30";
const label = "mb-1.5 block text-sm font-medium text-walnut dark:text-zinc-200";
const ghostBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-walnut/15 px-4 py-2 text-sm font-medium text-walnut transition-colors hover:border-walnut/30 disabled:pointer-events-none disabled:opacity-50 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/25 dark:hover:text-white";
const iconBtn =
  "grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-walnut/5 hover:text-walnut disabled:pointer-events-none disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white";

const STORAGE_FULL =
  "Could not save. Browser storage may be full or blocked. Remove a slide, or add the image by link instead of uploading it.";

// Always merge into the newest saved config, never a stale render's copy, so quick consecutive
// edits (typing, then flipping a switch) cannot undo each other.
function commit(patch: Partial<HeroConfig>) {
  return heroBackend.save({ ...heroBackend.getSnapshot(), ...patch });
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function isHttpUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Resolves true if the browser can load the link as an image.
function probeImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), 10000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src = url;
  });
}

// A text field that saves as you type (after a short pause) and immediately when it loses focus.
// It keeps its own draft so typing never waits on storage, and re-syncs if the saved value changes
// from elsewhere.
function DraftField({
  id,
  value,
  onSave,
  disabled,
  multiline,
  placeholder,
  ariaLabel,
}: {
  id?: string;
  value: string;
  onSave: (next: string) => void;
  disabled?: boolean;
  multiline?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    setDraft(value);
  }

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function change(next: string) {
    setDraft(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(next), 500);
  }
  function flush() {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    onSave(draft);
  }

  const shared = {
    id,
    value: draft,
    disabled,
    placeholder,
    "aria-label": ariaLabel,
    onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => change(e.target.value),
    onBlur: flush,
    className: input,
  };
  return multiline ? <textarea rows={3} {...shared} className={`${input} resize-y`} /> : <input {...shared} />;
}

type Device = "desktop" | "mobile";
const LIST_KEY = { desktop: "desktopSlides", mobile: "mobileSlides" } as const;
const DEVICE_HELP: Record<Device, string> = {
  desktop: "Shown on screens 768px wide and up. Wide photos work best.",
  mobile: "Shown on phones. Square or portrait photos work best. If this set is empty, the desktop slides are used.",
};

export default function HeroSettings() {
  const { config } = useHeroConfig();
  const uid = useId();

  // Each device has its own set of slides. This only picks which set the manager below edits.
  const [device, setDevice] = useState<Device>("desktop");
  const listKey = LIST_KEY[device];
  const slides = config[listKey];
  const full = slides.length >= MAX_SLIDES;

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [removing, setRemoving] = useState<Slide | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function run(patch: Partial<HeroConfig>) {
    setError("");
    try {
      await commit(patch);
      return true;
    } catch {
      setError(STORAGE_FULL);
      return false;
    }
  }

  const setSlides = (next: Slide[]) => run({ [listKey]: next } as Partial<HeroConfig>);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const room = MAX_SLIDES - heroBackend.getSnapshot()[listKey].length;
    if (room <= 0) {
      setError(`Each set holds up to ${MAX_SLIDES} slides. Remove one first.`);
      return;
    }

    setBusy(true);
    setError("");
    const added: Slide[] = [];
    const problems: string[] = [];
    for (const file of files.slice(0, room)) {
      try {
        added.push({ id: newId(), imageUrl: await fileToDataUrl(file, device === "mobile" ? 1200 : 1920), altText: "" });
      } catch (err) {
        problems.push(err instanceof Error ? err.message : `${file.name} could not be added.`);
      }
    }
    if (files.length > room) problems.push(`Only ${room} more ${room === 1 ? "slide fits" : "slides fit"}, so the rest were skipped.`);

    // One save for the whole batch, merged into the newest config.
    if (added.length) {
      try {
        await commit({ [listKey]: [...heroBackend.getSnapshot()[listKey], ...added] } as Partial<HeroConfig>);
      } catch {
        problems.push(STORAGE_FULL);
      }
    }
    setError(problems.join(" "));
    setBusy(false);
  }

  async function addUrl(e: React.FormEvent) {
    e.preventDefault();
    const url = urlInput.trim();
    setUrlError("");
    if (!isHttpUrl(url)) return setUrlError("Use a full link starting with https://");
    if (heroBackend.getSnapshot()[listKey].length >= MAX_SLIDES)
      return setUrlError(`Each set holds up to ${MAX_SLIDES} slides. Remove one first.`);

    setBusy(true);
    const ok = await probeImage(url);
    if (!ok) {
      setBusy(false);
      return setUrlError("That link did not load as an image. Check it and try again.");
    }
    if (await run({ [listKey]: [...heroBackend.getSnapshot()[listKey], { id: newId(), imageUrl: url, altText: "" }] } as Partial<HeroConfig>)) {
      setUrlInput("");
    }
    setBusy(false);
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...heroBackend.getSnapshot()[listKey]];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    void setSlides(next);
  }

  function setAlt(id: string, altText: string) {
    void setSlides(heroBackend.getSnapshot()[listKey].map((s) => (s.id === id ? { ...s, altText } : s)));
  }

  async function confirmRemove() {
    if (removing) await setSlides(heroBackend.getSnapshot()[listKey].filter((s) => s.id !== removing.id));
    setRemoving(null);
  }

  const intervals = INTERVAL_OPTIONS_MS.includes(config.autoplayIntervalMs as (typeof INTERVAL_OPTIONS_MS)[number])
    ? [...INTERVAL_OPTIONS_MS]
    : [...INTERVAL_OPTIONS_MS, config.autoplayIntervalMs].sort((a, b) => a - b);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-walnut dark:text-white">Hero</h1>
      <p className="mt-2 text-sm text-muted dark:text-zinc-400">
        The slideshow at the top of the catalog. Changes save automatically and show on the catalog right away.
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-red-700/30 bg-red-700/5 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-8 space-y-6">
        {/* Text overlay */}
        <section className={card} aria-labelledby={`${uid}-text`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={`${uid}-text`} className="text-base font-semibold text-walnut dark:text-white">
                Heading and text
              </h2>
              <p className="mt-1 text-sm text-muted dark:text-zinc-400">
                Show a heading and supporting text over the slides. Turn it off for photos only.
              </p>
            </div>
            <Switch
              checked={config.showTextOverlay}
              onChange={(next) => void run({ showTextOverlay: next })}
              label="Show heading and supporting text on the hero"
            />
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor={`${uid}-heading`} className={label}>Heading</label>
              <DraftField
                id={`${uid}-heading`}
                value={config.heading}
                disabled={!config.showTextOverlay}
                placeholder="Fresh Pasta Today"
                onSave={(v) => void run({ heading: v })}
              />
            </div>
            <div>
              <label htmlFor={`${uid}-subtext`} className={label}>Supporting text</label>
              <DraftField
                id={`${uid}-subtext`}
                multiline
                value={config.subtext}
                disabled={!config.showTextOverlay}
                placeholder="A short line under the heading"
                onSave={(v) => void run({ subtext: v })}
              />
            </div>
          </div>
        </section>

        {/* Slides */}
        <section className={card} aria-labelledby={`${uid}-slides`}>
          <h2 id={`${uid}-slides`} className="text-base font-semibold text-walnut dark:text-white">Slides</h2>
          <p className="mt-1 text-sm text-muted dark:text-zinc-400">
            Desktop and phones each have their own set, so every photo can be cropped for its screen.
            Upload photos or add them by link. Uploads are resized and kept in this browser.
          </p>

          <div
            role="group"
            aria-label="Which slides to edit"
            className="mt-5 inline-flex rounded-full border border-walnut/15 bg-walnut/[0.05] p-0.5 dark:border-white/10 dark:bg-white/5"
          >
            {(["desktop", "mobile"] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={device === d}
                onClick={() => {
                  setDevice(d);
                  setError("");
                  setUrlError("");
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  device === d
                    ? "bg-cream text-walnut shadow-sm dark:bg-white/10 dark:text-white dark:shadow-none"
                    : "text-muted hover:text-walnut dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {d === "desktop" ? "Desktop" : "Mobile"}{" "}
                <span className="tabular-nums opacity-70">({config[LIST_KEY[d]].length})</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted dark:text-zinc-400">
            {DEVICE_HELP[device]} {slides.length} of {MAX_SLIDES} slides.
          </p>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={busy || full} className={ghostBtn}>
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                {busy ? "Working" : "Upload images"}
              </button>
            </div>

            <form onSubmit={addUrl} noValidate className="min-w-0 flex-1">
              <div className="flex gap-2">
                <label htmlFor={`${uid}-url`} className="sr-only">Image link</label>
                <input
                  id={`${uid}-url`}
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={full ? `Limit of ${MAX_SLIDES} slides reached` : "Paste an image link, https://"}
                  disabled={full}
                  aria-invalid={!!urlError}
                  aria-describedby={urlError ? `${uid}-url-err` : undefined}
                  className={input}
                />
                <button type="submit" disabled={busy || full || !urlInput.trim()} className={ghostBtn}>
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                  Add
                </button>
              </div>
              {urlError && (
                <p id={`${uid}-url-err`} className="mt-1.5 text-xs text-red-700 dark:text-red-400">{urlError}</p>
              )}
            </form>
          </div>

          {slides.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-walnut/15 px-4 py-10 text-center text-sm text-muted dark:border-white/15 dark:text-zinc-400">
              {device === "mobile"
                ? "No mobile slides, so phones show the desktop slides. Add some to give phones their own."
                : "No desktop slides yet. Screens 768px and up use the mobile slides, or a plain background if there are none."}
            </p>
          ) : (
            <ol className="mt-6 space-y-3">
              {slides.map((slide, i) => (
                <li
                  key={slide.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-walnut/15 bg-cream/60 p-3 dark:border-white/10 dark:bg-zinc-950/40"
                >
                  <span className="w-5 text-center text-sm font-medium tabular-nums text-muted dark:text-zinc-500">{i + 1}</span>
                  <PastaImage key={slide.imageUrl} url={slide.imageUrl} alt="" className="h-16 w-28 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 basis-44">
                    <DraftField
                      ariaLabel={`Description of slide ${i + 1} for screen readers`}
                      value={slide.altText ?? ""}
                      placeholder="Describe this photo (optional)"
                      onSave={(v) => setAlt(slide.id, v)}
                    />
                  </div>
                  <div className="flex items-center">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move slide ${i + 1} up`} className={iconBtn}>
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1} aria-label={`Move slide ${i + 1} down`} className={iconBtn}>
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => setRemoving(slide)} aria-label={`Delete slide ${i + 1}`} className={iconBtn}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Autoplay */}
        <section className={card} aria-labelledby={`${uid}-auto`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={`${uid}-auto`} className="text-base font-semibold text-walnut dark:text-white">Autoplay</h2>
              <p className="mt-1 text-sm text-muted dark:text-zinc-400">
                Move to the next slide automatically. It pauses while a visitor hovers or focuses the hero, and never runs for people who prefer reduced motion.
              </p>
            </div>
            <Switch
              checked={config.enableAutoplay}
              onChange={(next) => void run({ enableAutoplay: next })}
              label="Advance slides automatically"
            />
          </div>

          <div className="mt-5 max-w-xs">
            <label htmlFor={`${uid}-interval`} className={label}>Time per slide</label>
            <select
              id={`${uid}-interval`}
              value={config.autoplayIntervalMs}
              disabled={!config.enableAutoplay}
              onChange={(e) => void run({ autoplayIntervalMs: Number(e.target.value) })}
              className={input}
            >
              {intervals.map((ms) => (
                <option key={ms} value={ms}>{ms / 1000} seconds</option>
              ))}
            </select>
          </div>
        </section>
      </div>

      <Modal open={removing !== null} onClose={() => setRemoving(null)} labelledBy="slide-delete-title">
        <div className="p-6 sm:p-8">
          <h2 id="slide-delete-title" className="text-xl font-semibold tracking-tight">Delete this slide?</h2>
          <p className="mt-2 text-sm text-muted dark:text-zinc-400">
            It leaves the hero right away. An uploaded image cannot be recovered, so you would need to upload it again.
          </p>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setRemoving(null)} className={ghostBtn}>Keep slide</button>
            <button
              type="button"
              onClick={confirmRemove}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 active:scale-[0.97]"
            >
              Delete slide
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
