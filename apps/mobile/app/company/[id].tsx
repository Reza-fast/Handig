import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyPage, useCompanyPhotos } from '@/api/company';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop';

const GALLERY_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
];

export default function CompanyPageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const { user } = useAuth();
  const { data: company, isLoading } = useCompanyPage(id ?? '');
  const { data: photos = [] } = useCompanyPhotos(id ?? '');

  const HERO_HEIGHT = height * 0.35;
  const GALLERY_ITEM_SIZE = width * 0.42;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (!company) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Company not found</Text>
      </View>
    );
  }

  const mainImage = company.avatarUrl || photos[0]?.url || PLACEHOLDER_IMAGE;
  const galleryImages =
    photos.length > 0 ? photos.map((p) => p.url) : [mainImage, ...GALLERY_PLACEHOLDERS];
  const isOwner = !!user && user.id === company.id;

  const addressParts = [
    company.street,
    company.streetNumber,
    company.zipCode,
    company.city,
  ].filter(Boolean);
  const addressLine = addressParts.join(' ');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroWrap, { height: HERO_HEIGHT }]}>
        <Image
          source={{ uri: mainImage }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]}>
            {company.companyName || 'Company'}
          </Text>
          {isOwner && (
            <Pressable
              onPress={() => router.push('/edit-company')}
              style={({ pressed }) => [
                styles.editBtn,
                { borderColor: colors.primary },
                pressed && styles.editBtnPressed,
              ]}
            >
              <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit my page</Text>
            </Pressable>
          )}
        </View>
        {addressLine ? (
          <Text style={[styles.address, { color: colors.textSecondary }]}>📍 {addressLine}</Text>
        ) : null}
        {company.companyDescription ? (
          <Text
            style={[styles.shortDescription, { color: colors.textSecondary }]}
            numberOfLines={3}
          >
            {company.companyDescription}
          </Text>
        ) : null}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Photos</Text>
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

      <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
      <View style={[styles.aboutCard, { backgroundColor: colors.card }]}>
        {company.companyDescription ? (
          <Text style={[styles.longDescription, { color: colors.textSecondary }]}>
            {company.companyDescription}
          </Text>
        ) : (
          <Text style={[styles.longDescription, { color: colors.textSecondary }]}>
            Get in touch to learn more about our services.
          </Text>
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact</Text>
      <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
        {company.email ? (
          <Pressable
            onPress={() => Linking.openURL(`mailto:${company.email}`)}
            style={styles.contactRow}
          >
            <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Email: </Text>
            <Text style={[styles.contactValue, { color: colors.primary }]}>{company.email}</Text>
          </Pressable>
        ) : null}
        {company.phone ? (
          <Pressable
            onPress={() => Linking.openURL(`tel:${company.phone}`)}
            style={styles.contactRow}
          >
            <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Phone: </Text>
            <Text style={[styles.contactValue, { color: colors.primary }]}>{company.phone}</Text>
          </Pressable>
        ) : null}
        {!company.email && !company.phone && (
          <Text style={[styles.longDescription, { color: colors.textSecondary }]}>
            No contact details listed.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingBottom: 32 },
  heroWrap: { width: '100%', overflow: 'hidden' },
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  name: { fontSize: 24, fontWeight: '800', flex: 1 },
  editBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 2 },
  editBtnPressed: { opacity: 0.9 },
  editBtnText: { fontSize: 14, fontWeight: '600' },
  address: { fontSize: 15, marginBottom: 8 },
  shortDescription: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  galleryScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
  galleryItem: { borderRadius: 16, overflow: 'hidden' },
  galleryImage: { width: '100%', height: '100%', borderRadius: 16 },
  aboutCard: { marginHorizontal: 16, padding: 20, borderRadius: 16 },
  longDescription: { fontSize: 16, lineHeight: 26 },
  contactCard: { marginHorizontal: 16, padding: 20, borderRadius: 16 },
  contactRow: { flexDirection: 'row', marginBottom: 8 },
  contactLabel: { fontSize: 16 },
  contactValue: { fontSize: 16, fontWeight: '600' },
});
