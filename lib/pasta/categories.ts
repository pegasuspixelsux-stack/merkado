import type { PastaCategory } from "@/types/pasta";

export const CATEGORIES: { id: PastaCategory; label: string }[] = [
  { id: "pasta", label: "Pasta" },
  { id: "sauces", label: "Sauces" },
  { id: "cheese", label: "Cheese" },
];

export const categoryLabel = (id: PastaCategory) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;
