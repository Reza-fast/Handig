import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';

export default function AccountTabScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Ensure profile row exists in DB when user is logged in (e.g. after sign-up or first visit)
  useEffect(() => {
    if (!user) return;
    api('/api/me').catch(() => {});
  }, [user?.id]);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sign in or create an account to manage your profile and provider listings.
        </Text>
        <Pressable
          onPress={() => router.push('/sign-in')}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary },
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/sign-up')}
          style={({ pressed }) => [
            styles.buttonSecondary,
            { borderColor: colors.border },
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={[styles.buttonSecondaryText, { color: colors.text }]}>Sign up</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Account</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
        {user.email}
      </Text>
      <Pressable
        onPress={() => router.push('/profile')}
        style={({ pressed }) => [
          styles.buttonSecondary,
          { borderColor: colors.border },
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonSecondaryText, { color: colors.text }]}>My profile</Text>
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
        onPress={() => signOut().then(() => router.replace('/(tabs)'))}
        style={[styles.signOut, { borderColor: colors.border }]}
      >
        <Text style={[styles.signOutText, { color: colors.textSecondary }]}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 24 },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonSecondary: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonSecondaryText: { fontSize: 16, fontWeight: '600' },
  signOut: {
    marginTop: 24,
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  signOutText: { fontSize: 15 },
});
