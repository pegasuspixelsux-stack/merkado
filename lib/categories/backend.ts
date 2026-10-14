import type { Category, NewCategory } from "@/types/category";

/**
 * Storage for categories. The localStorage adapter (./local.ts) implements it today. For Firestore,
 * write a second adapter (onSnapshot on a categories collection; addDoc, updateDoc, deleteDoc) and
 * change the one export in ./index.ts. Validation lives in ./api.ts, so an adapter only stores.
 */
export interface CategoryBackend {
  // Reactive read side, shaped for React's useSyncExternalStore.
  subscribe(onChange: () => void): () => void;
  getSnapshot(): Category[];
  getServerSnapshot(): Category[];

  create(data: NewCategory): Promise<Category>;
  update(id: string, patch: Partial<NewCategory>): Promise<Category>;
  remove(id: string): Promise<void>;
}
