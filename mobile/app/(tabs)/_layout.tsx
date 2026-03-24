import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, gradientProps } from '../../lib/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[400],
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface[950],
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1 }}>
            {/* Gradient top border */}
            <LinearGradient
              colors={gradients.brand}
              {...gradientProps.leftToRight}
              style={{ height: 1, opacity: 0.3 }}
            />
            <View style={{ flex: 1, backgroundColor: colors.surface[950] }} />
          </View>
        ),
        headerStyle: {
          backgroundColor: colors.surface[950],
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
