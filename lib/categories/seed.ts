import type { Category } from "@/types/category";

// The starting categories. The ids match the ones the sample products already use, so existing
// products keep their category. Names can be edited freely; ids never change.
export const SEED_CATEGORIES: Category[] = [
  { id: "pasta", name: "Pastas", slug: "pastas" },
  { id: "sauces", name: "Salsas", slug: "salsas" },
  { id: "cheese", name: "Quesos", slug: "quesos" },
];
