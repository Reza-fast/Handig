import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useProvider } from '@/api/providers';

export default function ProviderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { data: provider, isLoading } = useProvider(id ?? '');

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Provider not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.name, { color: colors.text }]}>{provider.name}</Text>
      {provider.rating != null && (
        <Text style={[styles.rating, { color: colors.primary }]}>
          ★ {provider.rating.toFixed(1)}
        </Text>
      )}
      {provider.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {provider.description}
        </Text>
      ) : null}
      {provider.address ? (
        <Text style={[styles.address, { color: colors.textSecondary }]}>
          📍 {provider.address}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 32 },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  rating: { fontSize: 16, marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 12 },
  address: { fontSize: 14 },
});
