import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useService } from '@/api/services';
import { useProvidersByService } from '@/api/providers';

export default function ServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { data: service, isLoading: serviceLoading } = useService(id ?? '');
  const { data: providers, isLoading: providersLoading } = useProvidersByService(id ?? '');

  const isLoading = serviceLoading || providersLoading;

  if (isLoading && !service) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Service not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        Providers
      </Text>
      {providersLoading ? (
        <Text style={{ color: colors.textSecondary }}>Loading providers...</Text>
      ) : (providers ?? []).length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          No providers yet for this service.
        </Text>
      ) : (
        (providers ?? []).map((p) => (
          <Link key={p.id} href={`/provider/${p.id}`} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={[styles.name, { color: colors.text }]}>{p.name}</Text>
              {p.description ? (
                <Text
                  style={[styles.description, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {p.description}
                </Text>
              ) : null}
              {p.rating != null ? (
                <Text style={[styles.rating, { color: colors.primary }]}>
                  ★ {p.rating.toFixed(1)}
                </Text>
              ) : null}
            </Pressable>
          </Link>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 32 },
  serviceName: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardPressed: { opacity: 0.9 },
  name: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  description: { fontSize: 14, marginBottom: 4 },
  rating: { fontSize: 14 },
  empty: { fontSize: 14 },
});
