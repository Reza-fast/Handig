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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';

type Profile = {
  id: string;
  displayName: string | null;
  accountType: string;
  phone: string | null;
  companyName: string | null;
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
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');

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
          setPhone(data.phone ?? '');
          setCompanyName(data.companyName ?? '');
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
          phone: phone.trim() || undefined,
          companyName: companyName.trim() || undefined,
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
      <Text style={[styles.label, { color: colors.textSecondary }]}>Display name</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
        ]}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
        placeholderTextColor={colors.textSecondary}
      />
      {profile?.accountType === 'individual' && (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
            ]}
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
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
            ]}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Company name"
            placeholderTextColor={colors.textSecondary}
          />
        </>
      )}

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary },
          pressed && styles.buttonPressed,
        ]}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save changes</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push('/my-providers')}
        style={({ pressed }) => [
          styles.buttonSecondary,
          { borderColor: colors.border },
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonSecondaryText, { color: colors.text }]}>My provider listings</Text>
      </Pressable>

      <Pressable
        onPress={handleSignOut}
        style={({ pressed }) => [
          styles.signOut,
          { borderColor: colors.border },
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.signOutText, { color: colors.textSecondary }]}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonSecondary: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 12,
  },
  buttonSecondaryText: { fontSize: 16, fontWeight: '600' },
  buttonPressed: { opacity: 0.9 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  signOut: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    borderTopWidth: 1,
  },
  signOutText: { fontSize: 15 },
});
