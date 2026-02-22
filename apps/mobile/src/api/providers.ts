import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Provider } from '@/types/model';

export interface MyProvider extends Provider {
  userId?: string | null;
}

/** Single provider by id (public). */
export function useProvider(providerId: string | null) {
  return useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => api<Provider>(`/api/providers/${providerId}`),
    enabled: !!providerId,
  });
}

/** List providers for a service (public). */
export function useProvidersByService(serviceId: string | null) {
  return useQuery({
    queryKey: ['providers-by-service', serviceId],
    queryFn: () =>
      api<Provider[]>(`/api/services/${serviceId}/providers`),
    enabled: !!serviceId,
  });
}

export function useMyProviders() {
  return useQuery({
    queryKey: ['my-providers'],
    queryFn: () => api<MyProvider[]>('/api/providers/my'),
  });
}

export function useProviderPhotos(providerId: string | null) {
  return useQuery({
    queryKey: ['provider-photos', providerId],
    queryFn: () =>
      api<{ id: string; url: string; sortOrder: number }[]>(
        `/api/providers/${providerId}/photos`
      ),
    enabled: !!providerId,
  });
}

export function useAddProviderMutation() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      categoryId: string;
      serviceId: string;
      description?: string;
      address?: string;
    }) =>
      api<MyProvider>('/api/providers', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => q.invalidateQueries({ queryKey: ['my-providers'] }),
  });
}

export function useUpdateProviderMutation(providerId: string) {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name?: string;
      description?: string;
      address?: string;
      imageUrl?: string;
    }) =>
      api<MyProvider>(`/api/providers/${providerId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ['my-providers'] });
      q.invalidateQueries({ queryKey: ['provider', providerId] });
    },
  });
}

export function useAddProviderPhotoMutation(providerId: string) {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (url: string) =>
      api<{ id: string; url: string; sortOrder: number }[]>(
        `/api/providers/${providerId}/photos`,
        {
          method: 'POST',
          body: JSON.stringify({ url }),
        }
      ),
    onSuccess: () =>
      q.invalidateQueries({ queryKey: ['provider-photos', providerId] }),
  });
}

export function useDeleteProviderPhotoMutation(providerId: string) {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) =>
      api(`/api/providers/${providerId}/photos/${photoId}`, {
        method: 'DELETE',
      }),
    onSuccess: () =>
      q.invalidateQueries({ queryKey: ['provider-photos', providerId] }),
  });
}
