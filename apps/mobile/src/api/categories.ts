import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import type { Category } from '@/types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/api/categories'),
  });
}
