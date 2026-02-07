import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { useTheme } from '@/theme/ThemeContext';
import { useCategories, useServices } from '@/api/categories';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200&h=200&fit=crop';

function CategorySection({
  categoryId,
  categoryName,
  cardWidth,
}: {
  categoryId: string;
  categoryName: string;
  cardWidth: number;
}) {
  const { colors } = useTheme();
  const { data: servicesList, isLoading } = useServices(categoryId);

  const RADIUS = 18;
  const BORDER_WIDTH = 2;
  const INNER_RADIUS = RADIUS - BORDER_WIDTH;

  const CARD_PADDING = 4;
  const IMAGE_SIZE = cardWidth - CARD_PADDING * 2;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {categoryName}
      </Text>

      {isLoading ? (
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading...
        </Text>
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
                  {
                    width: cardWidth,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: RADIUS,
                    borderWidth: BORDER_WIDTH,
                  },
                  pressed && styles.cardPressed,
                ]}
              >
                {/* IMAGE */}
                <View
                  style={{
                    width: IMAGE_SIZE,
                    aspectRatio: 1, // perfect square images
                    borderRadius: INNER_RADIUS,
                    overflow: 'hidden',
                    margin: CARD_PADDING,
                  }}
                >
                  <Image
                    source={s.imageUrl || PLACEHOLDER_IMAGE}
                    style={{ flex: 1 }}
                    contentFit="cover"
                    transition={200}
                  />
                </View>

                {/* SERVICE NAME */}
                <Text
                  style={[styles.serviceName, { color: colors.text }]}
                  numberOfLines={1}
                >
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
  const { width } = useWindowDimensions();
  const { data: categories, isLoading } = useCategories();

  const isTablet = width >= 768;
  const cardWidth = isTablet ? 320 : 270;

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
        <CategorySection
          key={cat.id}
          categoryId={cat.id}
          categoryName={cat.name}
          cardWidth={cardWidth}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },

  horizontalList: {
    gap: 14,
    paddingRight: 16,
  },

  serviceCard: {
    overflow: 'hidden',
    paddingBottom: 8,
  },

  cardPressed: {
    opacity: 0.9,
  },

  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 10,
  },

  loadingText: {
    fontSize: 14,
  },
});
