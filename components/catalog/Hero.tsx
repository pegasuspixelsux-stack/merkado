// A full-width, square (1:1) hero with a photo behind centered text. The nav floats transparent
// over its top edge. On wide screens the height is capped at one viewport so it never grows
// taller than the screen. It is a size container, so the type scales with the hero's own width
// (cqw units) and always fits.
// Photo: hands feeding fresh tagliatelle through a pasta machine, from Unsplash (Unsplash License).
const PHOTO = "https://images.unsplash.com/photo-1447279506476-3faec8071eee";
const photo = (w: number) => `${PHOTO}?w=${w}&h=${w / 2}&fit=crop&q=75&auto=format`;

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="@container relative aspect-square max-h-[100dvh] w-full overflow-hidden bg-zinc-900"
    >
      {/* Background photo. Decorative, so no alt text; the heading carries the meaning. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo(1600)}
        srcSet={`${photo(800)} 800w, ${photo(1600)} 1600w, ${photo(2400)} 2400w`}
        sizes="100vw"
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark scrim so white text stays readable in both light and dark themes. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/65"
      />

      <div className="relative flex h-full flex-col items-center justify-center p-[clamp(1rem,5cqw,3rem)] text-center">
        <h1
          id="hero-title"
          className="rise text-balance font-semibold leading-[1.02] tracking-tight text-white text-[clamp(1.75rem,8cqw,5rem)]"
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          Fresh Pasta Today
        </h1>
        <p
          className="rise mt-[clamp(0.375rem,1.5cqw,1rem)] max-w-[34ch] text-pretty leading-snug text-white/85 text-[clamp(0.8125rem,2.4cqw,1.25rem)]"
          style={{ "--d": "100ms" } as React.CSSProperties}
        >
          Rolled and filled by hand each morning. Pick what you need below and order on WhatsApp.
        </p>
      </div>
    </section>
  );
}
