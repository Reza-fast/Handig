import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useCategories, useServices } from '@/api/categories';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200&h=200&fit=crop';

function CategorySection({ categoryId, categoryName }: { categoryId: string; categoryName: string }) {
  const { colors } = useTheme();
  const { data: servicesList, isLoading } = useServices(categoryId);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{categoryName}</Text>
      {isLoading ? (
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {(servicesList ?? []).map((s) => (
            <Link key={s.id} href={`/service/${s.id}`} asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.serviceCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={[styles.imageWrap, { backgroundColor: colors.border }]}>
                  {s.imageUrl ? (
                    <Image
                      source={{ uri: s.imageUrl }}
                      style={styles.serviceImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={{ uri: PLACEHOLDER_IMAGE }}
                      style={styles.serviceImage}
                      resizeMode="cover"
                    />
                  )}
                </View>
                <Text style={[styles.serviceName, { color: colors.text }]} numberOfLines={2}>
                  {s.name}
                </Text>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export default function ExploreScreen() {
  const { colors } = useTheme();
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {(categories ?? []).map((cat) => (
        <CategorySection key={cat.id} categoryId={cat.id} categoryName={cat.name} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  horizontalList: { gap: 14, paddingRight: 16 },
  serviceCard: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.9 },
  imageWrap: {
    width: '100%',
    height: 100,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    padding: 10,
  },
  loadingText: { fontSize: 14 },
});
