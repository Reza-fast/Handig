import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

const AVATARS_BUCKET = 'avatars';
const PROVIDER_PHOTOS_BUCKET = 'provider-photos';

/**
 * Read a local image URI (file://, content://, ph://) and return an ArrayBuffer.
 * Uses expo-file-system so React Native picker URIs produce real file data (fetch(uri) often returns empty body).
 * Returns ArrayBuffer because React Native does not support creating Blobs from ArrayBufferView.
 */
export async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  let readUri = uri;
  if (!uri.startsWith('file://')) {
    const tempPath = `${FileSystem.cacheDirectory}upload_${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: tempPath });
    readUri = tempPath;
  }
  const base64 = await FileSystem.readAsStringAsync(readUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer;
}

/** Upload a profile/avatar image. Returns public URL or throws. */
export async function uploadAvatar(userId: string, body: ArrayBuffer): Promise<string> {
  const path = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, body, { contentType: 'image/jpeg', upsert: true });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}

/** Upload a provider photo. Returns public URL or throws. */
export async function uploadProviderPhoto(providerId: string, body: ArrayBuffer): Promise<string> {
  const path = `${providerId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(PROVIDER_PHOTOS_BUCKET)
    .upload(path, body, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from(PROVIDER_PHOTOS_BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}
