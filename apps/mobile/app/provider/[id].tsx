import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useProvider } from '@/api/providers';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop';

// Extra images for gallery when provider has only one image (placeholder set)
const GALLERY_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
];

export default function ProviderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const { data: provider, isLoading } = useProvider(id ?? '');

  const HERO_HEIGHT = height * 0.4;
  const GALLERY_ITEM_SIZE = width * 0.42;

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

  const mainImage = provider.imageUrl || PLACEHOLDER_IMAGE;
  const galleryImages = [mainImage, ...GALLERY_PLACEHOLDERS];

  // 5-star display with half stars: rating rounded to nearest 0.5 (e.g. 4.7 → 4.5)
  const starCount = 5;
  const filledValue =
    provider.rating != null
      ? Math.min(5, Math.max(0, Math.round(provider.rating * 2) / 2))
      : 0;
  const starSlots: (1 | 0.5 | 0)[] = Array.from({ length: starCount }, (_, i) => {
    const slotValue = i + 1;
    if (filledValue >= slotValue) return 1;
    if (filledValue >= slotValue - 0.5) return 0.5;
    return 0;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero image - top of page */}
      <View style={[styles.heroWrap, { height: HERO_HEIGHT }]}>
        <Image
          source={{ uri: mainImage }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      </View>

      {/* Info block - name, rating, address, short description */}
      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.name, { color: colors.text }]}>{provider.name}</Text>
        
        {provider.address ? (
          <Text style={[styles.address, { color: colors.textSecondary }]}>
            📍 {provider.address}
          </Text>
        ) : null}
        {provider.description ? (
          <Text
            style={[styles.shortDescription, { color: colors.textSecondary }]}
            numberOfLines={3}
          >
            {provider.description}
          </Text>
        ) : null}

{(provider.rating != null || filledValue > 0) && (
          <View style={styles.ratingRow}>
            <View style={styles.starsRow}>
              {starSlots.map((slot, i) =>
                slot === 1 ? (
                  <Text
                    key={i}
                    style={[styles.star, { color: colors.primary }]}
                  >
                    ★
                  </Text>
                ) : slot === 0.5 ? (
                  <View key={i} style={styles.halfStarWrap}>
                    <View style={styles.halfStarLeft}>
                      <Text style={[styles.star, { color: colors.primary }]}>
                        ★
                      </Text>
                    </View>
                    <View style={styles.halfStarRight}>
                      <View style={styles.halfStarRightInner}>
                        <Text style={[styles.star, { color: colors.textSecondary }]}>
                          ☆
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text
                    key={i}
                    style={[styles.star, { color: colors.textSecondary }]}
                  >
                    ☆
                  </Text>
                )
              )}
            </View>
            {provider.rating != null && (
              <Text style={[styles.ratingNumber, { color: colors.textSecondary }]}>
                {provider.rating.toFixed(1)}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Gallery - more pictures (scroll horizontally) */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Photos
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryScroll}
      >
        {galleryImages.map((uri, index) => (
          <View
            key={index}
            style={[
              styles.galleryItem,
              {
                width: GALLERY_ITEM_SIZE,
                height: GALLERY_ITEM_SIZE * 0.75,
                backgroundColor: colors.border,
              },
            ]}
          >
            <Image
              source={{ uri }}
              style={styles.galleryImage}
              contentFit="cover"
              transition={200}
            />
          </View>
        ))}
      </ScrollView>

      {/* More description */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        About
      </Text>
      <View style={[styles.aboutCard, { backgroundColor: colors.card }]}>
        {provider.description ? (
          <Text
            style={[styles.longDescription, { color: colors.textSecondary }]}
          >
            {provider.description}
          </Text>
        ) : (
          <Text
            style={[styles.longDescription, { color: colors.textSecondary }]}
          >
            Professional service with attention to detail. Get in touch to
            discuss your needs and book an appointment.
          </Text>
        )}
      </View>
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
  content: { paddingBottom: 32 },
  heroWrap: {
    width: '100%',
    overflow: 'hidden',
  },
  infoCard: {
    marginHorizontal: 12,
    marginTop: -24,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  name: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  star: { fontSize: 22 },
  halfStarWrap: {
    flexDirection: 'row',
    width: 22,
    overflow: 'hidden',
  },
  halfStarLeft: {
    width: 11,
    overflow: 'hidden',
  },
  halfStarRight: {
    width: 11,
    overflow: 'hidden',
  },
  halfStarRightInner: {
    position: 'absolute',
    left: -11,
    width: 22,
  },
  ratingNumber: { fontSize: 16, fontWeight: '600' },
  address: { fontSize: 15, marginBottom: 12 },
  shortDescription: { fontSize: 15, lineHeight: 22,marginBottom: 10 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  galleryScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 8,
  },
  galleryItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  aboutCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
  },
  longDescription: {
    fontSize: 16,
    lineHeight: 26,
  },
});
