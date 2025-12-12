export type ProductType = "FROZEN" | "SPICE";

export interface Product {
  id: string;
  name: string;

  type: ProductType;

  hsCode?: string | null;
  temperature?: string | null;
  packSize?: string | null;
  shelfLife?: string | null;

  unitsPerCarton?: number | null;
  cartonsPerPallet?: number | null;
  notes?: string | null;

  categoryId: string;

  // returned by API when include: { category: true }
  category?: {
    id: string;
    name: string;
  } | null;

  createdAt?: string;
  updatedAt?: string;
}
