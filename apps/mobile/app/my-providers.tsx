import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMyProviders } from '@/api/providers';

export default function MyProvidersScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { data: providers, isLoading, error } = useMyProviders();

  useEffect(() => {
    if (!user) router.replace('/sign-in');
  }, [user]);

  if (!user) return null;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Failed to load listings.</Text>
      </View>
    );
  }

  const list = providers ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            You have no provider listings yet.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/edit-provider/${item.id}`)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.cardPressed,
            ]}
          >
            <Text style={[styles.cardName, { color: colors.text }]}>{item.name}</Text>
            {item.address ? (
              <Text style={[styles.cardAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.address}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
      <Pressable
        onPress={() => router.push('/add-provider')}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary },
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.fabText}>+ Add listing</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 80 },
  empty: { textAlign: 'center', padding: 24, fontSize: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardPressed: { opacity: 0.9 },
  cardName: { fontSize: 17, fontWeight: '600' },
  cardAddress: { fontSize: 14, marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonPressed: { opacity: 0.9 },
});
