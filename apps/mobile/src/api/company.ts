import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export interface CompanyPage {
  id: string;
  companyName: string | null;
  companyDescription: string | null;
  street: string | null;
  streetNumber: string | null;
  zipCode: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

export interface CompanyPhoto {
  id: string;
  url: string;
  sortOrder: number;
}

/** Public company page by userId. */
export function useCompanyPage(userId: string | null) {
  return useQuery({
    queryKey: ['company', userId],
    queryFn: () => api<CompanyPage>(`/api/company/${userId}`),
    enabled: !!userId,
  });
}

/** Public company photos. */
export function useCompanyPhotos(userId: string | null) {
  return useQuery({
    queryKey: ['company-photos', userId],
    queryFn: () => api<CompanyPhoto[]>(`/api/company/${userId}/photos`),
    enabled: !!userId,
  });
}

/** My company photos (for edit screen). */
export function useMyCompanyPhotos() {
  return useQuery({
    queryKey: ['my-company-photos'],
    queryFn: () => api<CompanyPhoto[]>('/api/me/company-photos'),
  });
}

export function useAddCompanyPhotoMutation() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (url: string) =>
      api<CompanyPhoto[]>('/api/me/company-photos', {
        method: 'POST',
        body: JSON.stringify({ url }),
      }),
    onSuccess: () => q.invalidateQueries({ queryKey: ['my-company-photos'] }),
  });
}

export function useDeleteCompanyPhotoMutation() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) =>
      api(`/api/me/company-photos/${photoId}`, { method: 'DELETE' }),
    onSuccess: () => q.invalidateQueries({ queryKey: ['my-company-photos'] }),
  });
}
