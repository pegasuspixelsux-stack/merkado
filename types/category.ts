export interface Category {
  id: string; // stable, never changes (products point at it)
  name: string; // shown everywhere; editing it renames the category app-wide
  slug: string; // clean URL-safe form of the name, e.g. "Wine" -> "wine"
  description?: string;
  icon?: string; // optional image link (https:// or a /path)
}

// What a caller supplies when adding a category. Only the name is required.
export interface CategoryDetails {
  description?: string;
  icon?: string;
}

export type NewCategory = Omit<Category, "id">;
