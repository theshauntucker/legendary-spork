import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, gradientProps, headerGradient } from '../../lib/theme';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 48 }}>
      {focused ? (
        <View style={{
          shadowColor: colors.primary[500],
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 8,
        }}>
          <LinearGradient
            colors={gradients.brand}
            {...gradientProps.diagonal}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>{label}</Text>
          </LinearGradient>
        </View>
      ) : (
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18, opacity: 0.5 }}>{label}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface[900],
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          height: 88,
          paddingBottom: 28,
          paddingTop: 10,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1 }}>
            <LinearGradient
              colors={gradients.brand}
              {...gradientProps.leftToRight}
              style={{ height: 2, opacity: 0.6 }}
            />
            <View style={{ flex: 1, backgroundColor: colors.surface[900] }} />
          </View>
        ),
        headerStyle: {
          backgroundColor: colors.surface[950],
          elevation: 0,
          shadowOpacity: 0,
        },
        headerBackground: () => (
          <LinearGradient
            colors={headerGradient as unknown as string[]}
            {...gradientProps.topToBottom}
            style={{ flex: 1 }}
          />
        ),
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerTitle: () => (
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>
            Routine<Text style={{ color: colors.primary[400] }}>X</Text>
          </Text>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerTitle: () => (
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>
              Routine<Text style={{ color: colors.primary[400] }}>X</Text>
            </Text>
          ),
          tabBarIcon: ({ focused }) => <TabIcon label="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Analyze',
          headerTitle: () => (
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>
              Analyze a Routine
            </Text>
          ),
          tabBarIcon: ({ focused }) => <TabIcon label="✨" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: () => (
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>
              Profile
            </Text>
          ),
          tabBarIcon: ({ focused }) => <TabIcon label="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
