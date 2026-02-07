import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useService } from '@/api/services';
import { useProvidersByService } from '@/api/providers';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=500&fit=crop';

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
    {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    pressed && styles.cardPressed,
  ]}
>
  <View style={styles.imageWrap}>
    <Image
      source={p.imageUrl || PLACEHOLDER_IMAGE}
      style={styles.providerImage}
      contentFit="cover"
      transition={200}
    />
  </View>

  <View style={styles.cardContent}>
    <View>
      <Text
        style={[styles.name, { color: colors.text }]}
        numberOfLines={2}
      >
        {p.name}
      </Text>

      {p.description && (
        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {p.description}
        </Text>
      )}
    </View>

    {p.rating != null && (
      <Text style={[styles.rating, { color: colors.primary }]}>
        ★ {p.rating.toFixed(1)}
      </Text>
    )}
  </View>
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
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    minHeight: 180, // 👈 controls card height
  },
  
  imageWrap: {
    width: 150, // 👈 wider image
    height: '100%', // 👈 stretch full card height
    backgroundColor: '#eee',
  },
  
  providerImage: {
    width: '100%',
    height: '100%',
  },
  
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between', // 👈 better vertical layout
  },
  
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  
  rating: {
    fontSize: 15,
    fontWeight: '600',
  },
  empty: { fontSize: 14 },
});
