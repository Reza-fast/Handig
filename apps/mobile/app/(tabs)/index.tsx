import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
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

function CompanyHomeContent() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, styles.companyHome]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.companyHomeTitle, { color: colors.text }]}>Your company page</Text>
      <Text style={[styles.companyHomeSubtitle, { color: colors.textSecondary }]}>
        Manage your company page and content here. Individuals see the Explore tab to find services.
      </Text>
      <Pressable
        onPress={() => router.push(`/company/${user.id}`)}
        style={({ pressed }) => [
          styles.companyHomeBtn,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && styles.cardPressed,
        ]}
      >
        <Text style={[styles.companyHomeBtnText, { color: colors.text }]}>View my page</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push('/edit-company')}
        style={({ pressed }) => [
          styles.companyHomeBtnPrimary,
          { backgroundColor: colors.primary },
          pressed && styles.cardPressed,
        ]}
      >
        <Text style={styles.companyHomeBtnPrimaryText}>Edit my page</Text>
      </Pressable>
    </ScrollView>
  );
}

export default function ExploreScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api<{ accountType: string }>('/api/me'),
    enabled: !!user,
  });
  const { data: categories, isLoading } = useCategories();

  const isCompany = me?.accountType === 'company';
  const isTablet = width >= 768;
  const cardWidth = isTablet ? 320 : 270;

  if (user && meLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (user && isCompany) {
    return <CompanyHomeContent />;
  }

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

  companyHome: {
    paddingTop: 24,
  },
  companyHomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  companyHomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    color: '#94a3b8',
  },
  companyHomeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  companyHomeBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  companyHomeBtnPrimary: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  companyHomeBtnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
