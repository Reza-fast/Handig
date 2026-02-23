import { supabase } from './supabase';

const AVATARS_BUCKET = 'avatars';
const PROVIDER_PHOTOS_BUCKET = 'provider-photos';

/** Upload a profile/avatar image. Returns public URL or throws. */
export async function uploadAvatar(userId: string, blob: Blob): Promise<string> {
  const path = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}

/** Upload a provider photo. Returns public URL or throws. */
export async function uploadProviderPhoto(providerId: string, blob: Blob): Promise<string> {
  const path = `${providerId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(PROVIDER_PHOTOS_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from(PROVIDER_PHOTOS_BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}
