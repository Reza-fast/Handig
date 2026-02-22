import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';

type AccountType = 'individual' | 'company';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('individual');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    if (accountType === 'individual' && !phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }
    if (accountType === 'company' && !companyName.trim()) {
      Alert.alert('Error', 'Please enter your company name.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    if (error) {
      setLoading(false);
      Alert.alert('Sign up failed', error.message);
      return;
    }
    // Give Supabase a moment to set the session so the API call has a token
    await new Promise((r) => setTimeout(r, 400));
    try {
      await api('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({
          accountType,
          ...(accountType === 'individual' ? { phone: phone.trim() } : { companyName: companyName.trim() }),
        }),
      });
    } catch (e) {
      console.warn('Profile update failed:', e);
    }
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
            ]}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            autoComplete="new-password"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Account type</Text>
          <View style={styles.row}>
            <Pressable
              onPress={() => setAccountType('individual')}
              style={[
                styles.toggle,
                { borderColor: colors.border, backgroundColor: colors.card },
                accountType === 'individual' && { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
              ]}
            >
              <Text style={[styles.toggleText, { color: colors.text }]}>Individual</Text>
            </Pressable>
            <Pressable
              onPress={() => setAccountType('company')}
              style={[
                styles.toggle,
                { borderColor: colors.border, backgroundColor: colors.card },
                accountType === 'company' && { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
              ]}
            >
              <Text style={[styles.toggleText, { color: colors.text }]}>Company</Text>
            </Pressable>
          </View>

          {accountType === 'individual' && (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Phone number</Text>
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

          {accountType === 'company' && (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Company name</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                ]}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Your company name"
                placeholderTextColor={colors.textSecondary}
              />
            </>
          )}

          <Pressable
            onPress={handleSignUp}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary },
              pressed && styles.buttonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </Pressable>
          <View style={styles.footer}>
            <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
            <Link href="/sign-in" asChild>
              <Pressable>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 32 },
  form: {},
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  toggle: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleText: { fontSize: 15, fontWeight: '500' },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
});
