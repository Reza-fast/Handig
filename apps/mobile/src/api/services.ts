import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import type { Service } from '@/types';

export function useService(id: string) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => api<Service>(`/api/services/${id}`),
    enabled: !!id,
  });
}
