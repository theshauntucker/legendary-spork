import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1f2937',
        },
        headerStyle: {
          backgroundColor: '#0a0a0a',
        },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          // tabBarIcon will use a list icon
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Analyze',
          // tabBarIcon will use a video/camera icon
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          // tabBarIcon will use a user icon
        }}
      />
    </Tabs>
  );
}
