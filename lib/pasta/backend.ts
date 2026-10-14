import type { NewPastaItem, PastaItem } from "@/types/pasta";

/**
 * Everything the UI needs from a data source. The localStorage adapter (./local.ts)
 * implements it today. To move to Firestore, write a second adapter that satisfies this
 * interface (subscribe via onSnapshot, mutate via addDoc / updateDoc / deleteDoc) and change
 * the single export in ./index.ts. No component needs to change.
 */
export interface PastaBackend {
  // Reactive read side, shaped for React's useSyncExternalStore.
  subscribe(onChange: () => void): () => void;
  getSnapshot(): PastaItem[];
  getServerSnapshot(): PastaItem[];

  // Write side. Async so a network backend can replace it without API changes.
  create(data: NewPastaItem): Promise<PastaItem>;
  update(id: string, patch: Partial<NewPastaItem>): Promise<void>;
  remove(id: string): Promise<void>;
}
