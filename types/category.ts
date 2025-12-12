export interface Category {
  id: string;
  name: string;
  hsCode?: string | null;
  temperature?: string | null;
  storageType: "AMBIENT" | "CHILLED" | "FROZEN";
  documents?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
