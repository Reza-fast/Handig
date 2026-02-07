import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import type { Category, Service } from '@/types/model';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/api/categories'),
  });
}

export function useServices(categoryId: string) {
  return useQuery({
    queryKey: ['services', categoryId],
    queryFn: () => api<Service[]>(`/api/categories/${categoryId}/services`),
    enabled: !!categoryId,
  });
}
