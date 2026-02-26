import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';
import { uploadCompanyPhoto, uriToArrayBuffer } from '@/lib/storage';
import {
  useMyCompanyPhotos,
  useAddCompanyPhotoMutation,
  useDeleteCompanyPhotoMutation,
} from '@/api/company';
import { useQueryClient } from '@tanstack/react-query';

type Profile = {
  id: string;
  accountType: string;
  companyName: string | null;
  companyDescription: string | null;
};

export default function EditCompanyScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const queryClient = useQueryClient();
  const { data: photos = [], refetch: refetchPhotos } = useMyCompanyPhotos();
  const addPhotoMutation = useAddCompanyPhotoMutation();
  const deletePhotoMutation = useDeleteCompanyPhotoMutation();

  useEffect(() => {
    if (!user) {
      router.replace('/sign-in');
      return;
    }
    api<Profile>('/api/me')
      .then((p) => {
        if (p.accountType !== 'company') {
          router.replace('/(tabs)/account');
          return;
        }
        setCompanyName(p.companyName ?? '');
        setCompanyDescription(p.companyDescription ?? '');
      })
      .catch(() => router.replace('/(tabs)/account'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({
          companyName: companyName.trim() || undefined,
          companyDescription: companyDescription.trim() || undefined,
        }),
      });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['company', user.id] });
      }
      Alert.alert('Saved', 'Company page updated.');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photos to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    if (!user) return;
    setUploadingPhoto(true);
    try {
      const body = await uriToArrayBuffer(result.assets[0].uri);
      const url = await uploadCompanyPhoto(user.id, body);
      await addPhotoMutation.mutateAsync(url);
      refetchPhotos();
      if (user?.id) queryClient.invalidateQueries({ queryKey: ['company-photos', user.id] });
    } catch (e) {
      Alert.alert('Upload failed', (e as Error).message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddPhotoByUrl = async () => {
    const url = photoUrl.trim();
    if (!url) {
      Alert.alert('Error', 'Enter a photo URL.');
      return;
    }
    try {
      await addPhotoMutation.mutateAsync(url);
      setPhotoUrl('');
      refetchPhotos();
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert('Delete photo', 'Remove this photo from your company page?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePhotoMutation.mutateAsync(photoId);
          refetchPhotos();
          if (user?.id) queryClient.invalidateQueries({ queryKey: ['company-photos', user.id] });
        },
      },
    ]);
  };

  if (!user) return null;
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>Company name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={companyName}
        onChangeText={setCompanyName}
        placeholder="Your company name"
        placeholderTextColor={colors.textSecondary}
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>About / description</Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
        ]}
        value={companyDescription}
        onChangeText={setCompanyDescription}
        placeholder="Tell visitors about your company"
        placeholderTextColor={colors.textSecondary}
        multiline
      />

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary },
          pressed && styles.buttonPressed,
        ]}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save changes</Text>
        )}
      </Pressable>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Photos</Text>
      <Pressable
        onPress={handleUploadPhoto}
        disabled={uploadingPhoto}
        style={({ pressed }) => [
          styles.uploadPhotoBtn,
          { backgroundColor: colors.primary, borderColor: colors.primary },
          pressed && styles.buttonPressed,
        ]}
      >
        {uploadingPhoto ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Upload photo from device</Text>
        )}
      </Pressable>
      {photos.map((ph) => (
        <View key={ph.id} style={[styles.photoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image source={{ uri: ph.url }} style={styles.photoThumb} />
          <Pressable
            onPress={() => handleDeletePhoto(ph.id)}
            style={[styles.deleteBtn, { borderColor: colors.border }]}
          >
            <Text style={{ color: '#ef4444' }}>Remove</Text>
          </Pressable>
        </View>
      ))}
      <View style={styles.addPhotoRow}>
        <TextInput
          style={[
            styles.input,
            styles.flex1,
            { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
          ]}
          value={photoUrl}
          onChangeText={setPhotoUrl}
          placeholder="Or paste image URL"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
        <Pressable
          onPress={handleAddPhotoByUrl}
          disabled={addPhotoMutation.isPending || !photoUrl.trim()}
          style={({ pressed }) => [
            styles.addPhotoBtn,
            { backgroundColor: colors.primary },
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: { minHeight: 80 },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  photoThumb: { width: 56, height: 56, borderRadius: 8 },
  deleteBtn: { marginLeft: 12, padding: 8, borderWidth: 1, borderRadius: 8 },
  uploadPhotoBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  addPhotoRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 },
  flex1: { flex: 1, marginBottom: 0 },
  addPhotoBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
});
