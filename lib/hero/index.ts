import type { HeroBackend } from "./backend";
import { localHeroBackend } from "./local";

// The one line to change when Firebase replaces localStorage.
export const heroBackend: HeroBackend = localHeroBackend;
