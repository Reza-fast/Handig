export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  imageUrl: string | null;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  serviceId: string | null;
  address: string | null;
  rating: number | null;
  imageUrl: string | null;
  createdAt: string;
}
