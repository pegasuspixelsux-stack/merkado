"use client";

import { useSyncExternalStore } from "react";
import { heroBackend } from "@/lib/hero";

export function useHeroConfig() {
  const config = useSyncExternalStore(
    heroBackend.subscribe,
    heroBackend.getSnapshot,
    heroBackend.getServerSnapshot,
  );
  return { config, save: heroBackend.save };
}
