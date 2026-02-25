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

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const { user, updatePassword } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) router.replace('/sign-in');
  }, [user]);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Enter your current password.');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await updatePassword(currentPassword, newPassword);
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }
      Alert.alert('Done', 'Your password has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.text }]}>Change password</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Enter your current password, then choose a new one.
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Current password</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Enter current password"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!changingPassword}
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>New password</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="At least 6 characters"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!changingPassword}
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm new password</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Repeat new password"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!changingPassword}
      />
      <Pressable
        onPress={handleChangePassword}
        disabled={changingPassword}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary },
          pressed && styles.buttonPressed,
        ]}
      >
        {changingPassword ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Update password</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 24 },
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
  buttonPressed: { opacity: 0.9 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
