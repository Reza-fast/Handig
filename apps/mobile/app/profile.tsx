import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';
import { uploadAvatar, uriToArrayBuffer } from '@/lib/storage';

type Profile = {
  id: string;
  displayName: string | null;
  accountType: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  btwNumber: string | null;
  street: string | null;
  streetNumber: string | null;
  zipCode: string | null;
  city: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [btwNumber, setBtwNumber] = useState('');
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (!user) {
      router.replace('/sign-in');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await api<Profile>('/api/me');
        if (!cancelled) {
          setProfile(data);
          setDisplayName(data.displayName ?? '');
          setEmail(data.email ?? '');
          setPhone(data.phone ?? '');
          setCompanyName(data.companyName ?? '');
          setBtwNumber(data.btwNumber ?? '');
          setStreet(data.street ?? '');
          setStreetNumber(data.streetNumber ?? '');
          setZipCode(data.zipCode ?? '');
          setCity(data.city ?? '');
        }
      } catch (e) {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const data = await api<Profile>('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          companyName: companyName.trim() || undefined,
          btwNumber: btwNumber.trim() || undefined,
          street: street.trim() || undefined,
          streetNumber: streetNumber.trim() || undefined,
          zipCode: zipCode.trim() || undefined,
          city: city.trim() || undefined,
        }),
      });
      setProfile(data);
      Alert.alert('Saved', 'Profile updated.');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePickProfilePicture = async () => {
    if (!user) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photos to upload a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setUploadingAvatar(true);
    try {
      const body = await uriToArrayBuffer(result.assets[0].uri);
      const url = await uploadAvatar(user.id, body);
      const data = await api<Profile>('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({ avatarUrl: url }),
      });
      setProfile(data);
      Alert.alert('Done', 'Profile picture updated.');
    } catch (e) {
      Alert.alert('Upload failed', (e as Error).message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  if (authLoading || (user && loading && !profile)) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile picture */}
      <View style={styles.avatarSection}>
        {profile?.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card }]}>
            <Text style={[styles.avatarPlaceholderText, { color: colors.textSecondary }]}>No photo</Text>
          </View>
        )}
        <Pressable
          onPress={handlePickProfilePicture}
          disabled={uploadingAvatar}
          style={({ pressed }) => [
            styles.changePhotoBtn,
            { borderColor: colors.primary },
            pressed && styles.buttonPressed,
          ]}
        >
          {uploadingAvatar ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>Change profile picture</Text>
          )}
        </Pressable>
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Display name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
        placeholderTextColor={colors.textSecondary}
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor={colors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {profile?.accountType === 'individual' && (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="+32 123 45 67 89"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />
        </>
      )}
      {profile?.accountType === 'company' && (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Company name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Company name"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={[styles.label, { color: colors.textSecondary }]}>BTW number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={btwNumber}
            onChangeText={setBtwNumber}
            placeholder="BE0123456789"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
          />
        </>
      )}

      <Text style={[styles.label, { color: colors.textSecondary }]}>Street</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={street}
        onChangeText={setStreet}
        placeholder="Street name"
        placeholderTextColor={colors.textSecondary}
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Number</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={streetNumber}
        onChangeText={setStreetNumber}
        placeholder="House / building number"
        placeholderTextColor={colors.textSecondary}
        keyboardType="default"
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Zip code</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={zipCode}
        onChangeText={setZipCode}
        placeholder="e.g. 1000"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>City</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={city}
        onChangeText={setCity}
        placeholder="City"
        placeholderTextColor={colors.textSecondary}
      />

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={({ pressed }) => [styles.button, { backgroundColor: colors.primary }, pressed && styles.buttonPressed]}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save changes</Text>}
      </Pressable>

      <Pressable
        onPress={() => router.push('/my-providers')}
        style={({ pressed }) => [styles.buttonSecondary, { borderColor: colors.border }, pressed && styles.buttonPressed]}
      >
        <Text style={[styles.buttonSecondaryText, { color: colors.text }]}>My provider listings</Text>
      </Pressable>

      <Pressable onPress={handleSignOut} style={[styles.signOut, { borderColor: colors.border }]}>
        <Text style={[styles.signOutText, { color: colors.textSecondary }]}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  avatarPlaceholderText: { fontSize: 12 },
  changePhotoBtn: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 2 },
  changePhotoText: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonSecondary: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, marginTop: 12 },
  buttonSecondaryText: { fontSize: 16, fontWeight: '600' },
  buttonPressed: { opacity: 0.9 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  signOut: { marginTop: 24, paddingVertical: 14, alignItems: 'center', borderTopWidth: 1 },
  signOutText: { fontSize: 15 },
});
