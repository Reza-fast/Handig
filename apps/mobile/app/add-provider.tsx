import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useCategories, useServices } from '@/api/categories';
import { useAddProviderMutation } from '@/api/providers';

export default function AddProviderScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const [categoryId, setCategoryId] = useState('');
  const { data: services = [] } = useServices(categoryId);
  const [serviceId, setServiceId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const addMutation = useAddProviderMutation();

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Please select a category.');
      return;
    }
    if (!serviceId) {
      Alert.alert('Error', 'Please select a service.');
      return;
    }
    try {
      await addMutation.mutateAsync({
        name: name.trim(),
        categoryId,
        serviceId,
        description: description.trim() || undefined,
        address: address.trim() || undefined,
      });
      Alert.alert('Done', 'Listing created.');
      router.back();
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

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
        placeholder="Business or your name"
        placeholderTextColor={colors.textSecondary}
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
      <View style={styles.row}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => {
              setCategoryId(c.id);
              setServiceId('');
            }}
            style={[
              styles.chip,
              { borderColor: colors.border, backgroundColor: colors.card },
              categoryId === c.id && { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
            ]}
          >
            <Text style={[styles.chipText, { color: colors.text }]}>{c.name}</Text>
          </Pressable>
        ))}
      </View>
      {categoryId ? (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Service</Text>
          <View style={styles.row}>
            {services.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setServiceId(s.id)}
                style={[
                  styles.chip,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  serviceId === s.id && { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
                ]}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>{s.name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
      <Text style={[styles.label, { color: colors.textSecondary }]}>Description (optional)</Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="What you offer"
        placeholderTextColor={colors.textSecondary}
        multiline
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Address (optional)</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
        ]}
        value={address}
        onChangeText={setAddress}
        placeholder="Street, city"
        placeholderTextColor={colors.textSecondary}
      />
      <Pressable
        onPress={handleSubmit}
        disabled={addMutation.isPending}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary },
          pressed && styles.buttonPressed,
        ]}
      >
        {addMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create listing</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontSize: 14 },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
