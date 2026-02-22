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
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { api } from '@/api/client';
import {
  useProviderPhotos,
  useUpdateProviderMutation,
  useAddProviderPhotoMutation,
  useDeleteProviderPhotoMutation,
} from '@/api/providers';

export default function EditProviderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const providerId = id ?? '';
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const { data: photos = [], refetch: refetchPhotos } = useProviderPhotos(providerId || null);
  const updateMutation = useUpdateProviderMutation(providerId);
  const addPhotoMutation = useAddProviderPhotoMutation(providerId);
  const deletePhotoMutation = useDeleteProviderPhotoMutation(providerId);

  useEffect(() => {
    if (!providerId) return;
    api<{ name: string; description: string | null; address: string | null }>(`/api/providers/${providerId}`)
      .then((p) => {
        setName(p.name);
        setDescription(p.description ?? '');
        setAddress(p.address ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [providerId]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        address: address.trim() || undefined,
      });
      Alert.alert('Saved', 'Listing updated.');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const handleAddPhoto = async () => {
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
    Alert.alert('Delete photo', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deletePhotoMutation.mutate(photoId),
      },
    ]);
  };

  if (!providerId) return null;
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
      <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
        ]}
        value={name}
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor={colors.textSecondary}
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        placeholderTextColor={colors.textSecondary}
        multiline
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Address</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
        ]}
        value={address}
        onChangeText={setAddress}
        placeholder="Address"
        placeholderTextColor={colors.textSecondary}
      />

      <Pressable
        onPress={handleSave}
        disabled={updateMutation.isPending}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary },
          pressed && styles.buttonPressed,
        ]}
      >
        {updateMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save changes</Text>
        )}
      </Pressable>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Photos</Text>
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
          placeholder="Paste image URL (e.g. from Supabase Storage)"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
        <Pressable
          onPress={handleAddPhoto}
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
  addPhotoRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 },
  flex1: { flex: 1, marginBottom: 0 },
  addPhotoBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
});
