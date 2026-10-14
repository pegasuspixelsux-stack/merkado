"use client";

import { useEffect, useRef, useState } from "react";

// Shows as many lines of `text` as fit in the space the parent gives it (flex-1), then ends
// with an ellipsis. The line count follows the box size, so cards of any width or height fill
// their space without the text ever pushing into the row below.
export default function FillText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const para = useRef<HTMLParagraphElement>(null);
  const [lines, setLines] = useState(3); // sensible default for the server render

  useEffect(() => {
    const el = box.current;
    const p = para.current;
    if (!el || !p) return;

    const fit = () => {
      const lineHeight = parseFloat(getComputedStyle(p).lineHeight);
      if (!lineHeight || Number.isNaN(lineHeight)) return;
      setLines(Math.max(1, Math.floor(el.clientHeight / lineHeight)));
    };

    // Fires once on observe, then whenever the box or its content width changes.
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="mt-1 min-h-0 flex-1 overflow-hidden sm:mt-2">
      <p
        ref={para}
        className={className}
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: lines,
          overflow: "hidden",
        }}
      >
        {text}
      </p>
    </div>
  );
}
