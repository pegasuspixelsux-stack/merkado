"use client";

import { useSyncExternalStore } from "react";
import { categoryBackend } from "@/lib/categories";

export const UNCATEGORIZED = "Uncategorized";

export function useCategories() {
  const categories = useSyncExternalStore(
    categoryBackend.subscribe,
    categoryBackend.getSnapshot,
    categoryBackend.getServerSnapshot,
  );

  // The live display name for a category id. Products with no category, or one that has since
  // been deleted, read as "Uncategorized", so nothing ever shows a raw id.
  const nameOf = (id: string) => categories.find((c) => c.id === id)?.name ?? UNCATEGORIZED;

  return { categories, nameOf };
}
