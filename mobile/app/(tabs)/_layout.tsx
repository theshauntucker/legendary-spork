import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#a855f7',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1f2937',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#0a0a0a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerTitle: 'Your Analyses',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>📊</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Analyze',
          headerTitle: 'Analyze a Routine',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>🎬</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Profile & Settings',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
