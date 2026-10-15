import type { Category, CategoryDetails } from "@/types/category";
import { pastaBackend } from "@/lib/pasta";
import { categoryBackend } from "./index";
import { uniqueSlug, validateDescription, validateIcon, validateName } from "./rules";

// The management helper. These are plain async functions (no React needed), and they validate
// before anything is stored. Components read the list reactively with useCategories().
// All of them reject with a readable Error message, such as "There is already a category called ...".

export async function getCategories(): Promise<Category[]> {
  return categoryBackend.getSnapshot();
}

// Adds a category. Only the name is required; the slug is generated ("Wine" -> "wine").
export async function addCategory(name: string, details: CategoryDetails = {}): Promise<Category> {
  const existing = categoryBackend.getSnapshot();
  const clean = validateName(name, existing);
  return categoryBackend.create({
    name: clean,
    slug: uniqueSlug(clean, existing),
    description: validateDescription(details.description),
    icon: validateIcon(details.icon),
  });
}

// Changes any of name, description or icon. Pass an empty string to clear description or icon.
// Products point at the category's id, so a rename shows up everywhere straight away.
export async function updateCategory(
  id: string,
  newDetails: Partial<CategoryDetails> & { name?: string },
): Promise<Category> {
  const existing = categoryBackend.getSnapshot();
  const current = existing.find((c) => c.id === id);
  if (!current) throw new Error("Esa categoría ya no existe.");

  const patch: Partial<Category> = {};
  if (newDetails.name !== undefined) {
    patch.name = validateName(newDetails.name, existing, id);
    patch.slug = uniqueSlug(patch.name, existing, id);
  }
  if (newDetails.description !== undefined) patch.description = validateDescription(newDetails.description);
  if (newDetails.icon !== undefined) patch.icon = validateIcon(newDetails.icon);

  return categoryBackend.update(id, patch);
}

// Removes a category. Products inside it are not deleted: they become uncategorized and stay in
// the catalog. Products are updated first, so a failure part-way leaves the category in place.
export async function deleteCategory(id: string): Promise<void> {
  await pastaBackend.clearCategory(id);
  await categoryBackend.remove(id);
}
