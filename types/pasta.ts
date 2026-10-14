export interface PastaItem {
  id: string;
  title: string;
  category: string; // a Category id, or "" for uncategorized
  description: string;
  price: number;
  unit: string; // e.g. "500g", "kg", "unit"
  imageUrl: string; // empty string shows the placeholder
  available: boolean;
}

export type NewPastaItem = Omit<PastaItem, "id">;
