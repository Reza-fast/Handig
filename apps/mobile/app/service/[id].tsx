import { View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useService } from '@/api/services';
import { useProvidersByService } from '@/api/providers';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=500&fit=crop';

export default function ServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const { data: service, isLoading: serviceLoading } = useService(id ?? '');
  const { data: providers, isLoading: providersLoading } = useProvidersByService(id ?? '');

  const isTablet = width >= 768;

  // 1. HEIGHT CHANGE: Multiplied by 1.8 for portrait look
  const IMAGE_WIDTH = isTablet ? 200 : 180; 
  const IMAGE_HEIGHT = IMAGE_WIDTH * 1.8; 
  const RADIUS = 18;
  const BORDER_WIDTH = 2;
  const INNER_RADIUS = RADIUS - BORDER_WIDTH;

  // 2. RATING SYSTEM: Helper to render 5 stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text 
            key={star} 
            style={[
              styles.star, 
              { color: star <= fullStars ? '#FFD700' : colors.border }
            ]}
          >
            {star <= fullStars ? '★' : '☆'}
          </Text>
        ))}
        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
          ({rating.toFixed(1)})
        </Text>
      </View>
    );
  };

  if (serviceLoading && !service) {
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
      <Text style={[styles.serviceName, { color: colors.text }]}>{service?.name}</Text>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Providers</Text>

      {(providers ?? []).map((p, index) => {
        const isLast = index === (providers ?? []).length - 1;
        
        // FIXED: Added 'return' here so the components actually render
        return (
          <View key={p.id} style={{ marginBottom: 30 }}>
     <Link key={p.id} href={`/provider/${p.id}`} asChild>
          <Pressable style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: RADIUS,
                  borderWidth: BORDER_WIDTH,
                  minHeight: IMAGE_HEIGHT + 8,
                  // Apply gap only to the bottom of cards, except the last one if preferred
                  marginBottom: isLast ? 16 : 90, 
                },
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.cardRow}>
                <View
                  style={[
                    styles.imageWrap,
                    {
                      width: IMAGE_WIDTH,
                      height: IMAGE_HEIGHT,
                      borderRadius: INNER_RADIUS,
                      margin: 4,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: p.imageUrl || PLACEHOLDER_IMAGE }}
                    style={styles.providerImage}
                    contentFit="cover"
                    transition={200}
                  />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.textBlock}>
                    <Text
                      style={[styles.name, { color: colors.text, fontSize: isTablet ? 22 : 18 }]}
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>

                    {p.description && (
                      <Text
                        style={[styles.description, { color: colors.textSecondary, fontSize: isTablet ? 16 : 14 }]}
                        numberOfLines={isTablet ? 10 : 8} 
                      >
                        {p.description}
                      </Text>
                    )}
                  </View>

                  {p.rating != null ? renderStars(p.rating) : null}
                </View>
              </View>
            </Pressable>
          </Link>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  serviceName: { fontSize: 26, fontWeight: '800', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  card: { 
    overflow: 'hidden',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', width: '100%' },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  imageWrap: { backgroundColor: '#eee', overflow: 'hidden', flexShrink: 0 },
  providerImage: { width: '100%', height: '100%' },
  cardContent: {
    flex: 1,
    padding: 16, // Reduced slightly from 25 for better text room
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  textBlock: { marginBottom: 10 },
  name: { fontWeight: '700', marginBottom: 6 },
  description: { lineHeight: 20 },
  starContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  star: { fontSize: 18, marginRight: 2 },
  ratingText: { fontSize: 13, fontWeight: '600', marginLeft: 4 },
});