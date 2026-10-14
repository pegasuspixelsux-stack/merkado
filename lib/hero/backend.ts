import type { HeroConfig } from "@/types/hero";

/**
 * Everything the UI needs from the hero settings store. The localStorage adapter (./local.ts)
 * implements it today. For Firebase, write a second adapter (onSnapshot on a single settings
 * document, setDoc on save, Firebase Storage for uploaded images instead of data URLs) and change
 * the one export in ./index.ts.
 */
export interface HeroBackend {
  // Reactive read side, shaped for React's useSyncExternalStore.
  subscribe(onChange: () => void): () => void;
  getSnapshot(): HeroConfig;
  getServerSnapshot(): HeroConfig;

  // Rejects (and changes nothing) if the config could not be stored.
  save(config: HeroConfig): Promise<void>;
}
