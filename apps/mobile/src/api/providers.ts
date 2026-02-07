import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import type { Provider } from '@/types/model';

export function useProvidersByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['providers', categoryId],
    queryFn: () =>
      api<Provider[]>(`/api/categories/${categoryId}/providers`),
    enabled: !!categoryId,
  });
}

export function useProvidersByService(serviceId: string) {
  return useQuery({
    queryKey: ['providers', 'service', serviceId],
    queryFn: () => api<Provider[]>(`/api/services/${serviceId}/providers`),
    enabled: !!serviceId,
  });
}

export function useProvider(id: string) {
  return useQuery({
    queryKey: ['provider', id],
    queryFn: () => api<Provider>(`/api/providers/${id}`),
    enabled: !!id,
  });
}
