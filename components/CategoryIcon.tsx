"use client";

import { useState } from "react";

// A category's optional icon or image. Renders nothing when there is none or the link is broken,
// so callers can place it freely. Callers pass key={icon} so a changed link tries again.
export default function CategoryIcon({ icon, className = "" }: { icon?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!icon || failed) return null;
  return (
    // Admin-supplied links can point anywhere, so a plain <img> is used instead of next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={icon} alt="" onError={() => setFailed(true)} className={`object-cover ${className}`} />
  );
}
