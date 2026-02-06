import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useCategories } from '@/api/categories';

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
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Categories
      </Text>
      <View style={styles.grid}>
        {(categories ?? []).map((cat) => (
          <Link key={cat.id} href={`/category/${cat.id}`} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {cat.name}
              </Text>
              <Text
                style={[styles.cardSubtitle, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {cat.description ?? ''}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  grid: { gap: 12 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardPressed: { opacity: 0.9 },
  cardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  cardSubtitle: { fontSize: 14 },
});
