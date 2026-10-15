import type { Category } from "@/types/category";
import type { CategoryBackend } from "./backend";
import { SEED_CATEGORIES } from "./seed";

const KEY = "merkado:categories:v1";
const listeners = new Set<() => void>();
let cache: Category[] | null = null;

function isCategory(v: unknown): v is Category {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.slug === "string" &&
    (o.description === undefined || typeof o.description === "string") &&
    (o.icon === undefined || typeof o.icon === "string")
  );
}

// The snapshot must be referentially stable between changes, so it is cached. A saved empty list
// is respected (someone may delete every category); only a missing or broken save falls back to
// the seed.
function load(): Category[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every(isCategory)) {
        cache = parsed;
        return cache;
      }
    }
  } catch {
    // Blocked or corrupt storage: fall back to the seed.
  }
  cache = SEED_CATEGORIES;
  return cache;
}

// Write first. If storage is full or blocked this throws and nothing in memory changes.
function commit(next: Category[]) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  cache = next;
  listeners.forEach((l) => l());
}

// Keeps other open tabs in sync.
function onStorage(e: StorageEvent) {
  if (e.key === KEY || e.key === null) {
    cache = null;
    listeners.forEach((l) => l());
  }
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const localCategoryBackend: CategoryBackend = {
  subscribe(onChange) {
    listeners.add(onChange);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onChange);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot: load,
  getServerSnapshot: () => SEED_CATEGORIES,

  async create(data) {
    const category: Category = { ...data, id: newId() };
    commit([...load(), category]);
    return category;
  },
  async update(id, patch) {
    const current = load();
    const found = current.find((c) => c.id === id);
    if (!found) throw new Error("Esa categoría ya no existe.");
    const updated: Category = { ...found, ...patch };
    // Clearing an optional field removes it instead of storing an empty string.
    if (!updated.description) delete updated.description;
    if (!updated.icon) delete updated.icon;
    commit(current.map((c) => (c.id === id ? updated : c)));
    return updated;
  },
  async remove(id) {
    commit(load().filter((c) => c.id !== id));
  },
};
