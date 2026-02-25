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
import { supabase } from '@/lib/supabase';

export default function DeleteAccountScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) router.replace('/sign-in');
  }, [user]);

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Enter your password to confirm.');
      return;
    }
    const email = user?.email;
    if (!email) {
      Alert.alert('Error', 'Not signed in.');
      return;
    }
    setDeleting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        Alert.alert('Error', 'Wrong password. Enter your current password to delete your account.');
        return;
      }
      await api('/api/me', { method: 'DELETE' });
      await signOut();
      router.replace('/sign-in');
      Alert.alert('Account deleted', 'Your account has been permanently deleted.');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account, profile, and all your provider listings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete my account', style: 'destructive', onPress: handleDeleteAccount },
      ]
    );
  };

  if (!user) return null;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.text }]}>Delete account</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        This will permanently remove your account, profile data, and all your provider listings. This action cannot be undone.
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Enter your password to confirm</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={password}
        onChangeText={setPassword}
        placeholder="Your current password"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!deleting}
      />
      <Pressable
        onPress={confirmDelete}
        disabled={deleting}
        style={({ pressed }) => [
          styles.deleteButton,
          { borderColor: '#dc2626' },
          pressed && styles.buttonPressed,
        ]}
      >
        {deleting ? (
          <ActivityIndicator color="#dc2626" size="small" />
        ) : (
          <Text style={[styles.deleteButtonText, { color: '#dc2626' }]}>Delete my account</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 24, lineHeight: 22 },
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  deleteButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    marginTop: 8,
  },
  deleteButtonText: { fontSize: 16, fontWeight: '600' },
  buttonPressed: { opacity: 0.9 },
});
