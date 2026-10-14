"use client";

import { useState } from "react";
import { Wheat } from "lucide-react";

// Admin-supplied URLs can point anywhere, so a plain <img> is used instead of next/image.
// Callers pass key={url} so a changed URL resets the failed state.
export default function PastaImage({
  url,
  alt,
  className = "",
}: {
  url: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`grid place-items-center bg-gradient-to-br from-stone-200 to-stone-300 text-zinc-400 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-600 ${className}`}
      >
        <Wheat className="h-8 w-8" strokeWidth={1.25} aria-hidden="true" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
