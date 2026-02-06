export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
}

export interface Provider {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  address: string | null;
  rating: number | null;
  imageUrl: string | null;
  createdAt: string;
}
