import { Tabs } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';

type Me = { accountType: string };

export default function TabLayout() {
  const { user } = useAuth();
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => api<Me>('/api/me'),
    enabled: !!user,
  });
  const isCompany = me?.accountType === 'company';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#0f172a' },
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#f8fafc',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isCompany ? 'My company' : 'Explore',
          tabBarLabel: isCompany ? 'My company' : 'Explore',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarLabel: 'Search',
          tabBarButton: isCompany ? () => null : undefined,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarLabel: 'Favorites',
          tabBarButton: isCompany ? () => null : undefined,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarLabel: 'Account',
        }}
      />
    </Tabs>
  );
}
