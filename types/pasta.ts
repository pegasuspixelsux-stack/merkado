export type PastaCategory = "pasta" | "sauces" | "cheese";

export interface PastaItem {
  id: string;
  title: string;
  category: PastaCategory;
  description: string;
  price: number;
  unit: string; // e.g. "500g", "kg", "unit"
  imageUrl: string; // empty string shows the placeholder
  available: boolean;
}

export type NewPastaItem = Omit<PastaItem, "id">;
