import type { Category } from "@/types/category";

export const MAX_NAME_LENGTH = 40;
export const MAX_DESCRIPTION_LENGTH = 160;

// "Wine" -> "wine", "Salsas Artesanales" -> "salsas-artesanales", "Ñoquis" -> "noquis"
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Same name ignoring case and accents counts as a duplicate ("vinos" vs "Vinos" vs "Víños").
const key = (name: string) => slugify(name);

export function validateName(name: string, existing: Category[], ignoreId?: string): string {
  const clean = name.trim().replace(/\s+/g, " ");
  if (!clean) throw new Error("Enter a name for the category.");
  if (clean.length > MAX_NAME_LENGTH) throw new Error(`Keep the name to ${MAX_NAME_LENGTH} characters or fewer.`);
  if (!slugify(clean)) throw new Error("Use at least one letter or number in the name.");
  if (existing.some((c) => c.id !== ignoreId && key(c.name) === key(clean)))
    throw new Error(`There is already a category called "${clean}".`);
  return clean;
}

// A slug no other category uses: "wine", then "wine-2", "wine-3"...
export function uniqueSlug(name: string, existing: Category[], ignoreId?: string): string {
  const base = slugify(name) || "category";
  const taken = new Set(existing.filter((c) => c.id !== ignoreId).map((c) => c.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function validateDescription(description: string | undefined): string | undefined {
  const clean = description?.trim();
  if (!clean) return undefined;
  if (clean.length > MAX_DESCRIPTION_LENGTH)
    throw new Error(`Keep the description to ${MAX_DESCRIPTION_LENGTH} characters or fewer.`);
  return clean;
}

// An image link. Empty is fine; otherwise it must be a full http(s) link or a site path.
export function validateIcon(icon: string | undefined): string | undefined {
  const clean = icon?.trim();
  if (!clean) return undefined;
  if (clean.startsWith("/") && !clean.startsWith("//")) return clean;
  try {
    const u = new URL(clean);
    if (u.protocol === "http:" || u.protocol === "https:") return clean;
  } catch {
    // falls through to the error below
  }
  throw new Error("Use a full link starting with https://, or a path starting with /");
}
