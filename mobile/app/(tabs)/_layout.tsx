import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../lib/auth';
import { colors, gradients, gradientProps, headerGradient } from '../../lib/theme';

const ADMIN_EMAIL = (process.env.EXPO_PUBLIC_ADMIN_EMAIL || '22tucker22@comcast.net').toLowerCase();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 44 }}>
      {focused ? (
        <View style={{
          shadowColor: colors.primary[500],
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 6,
        }}>
          <LinearGradient
            colors={gradients.brand}
            {...gradientProps.diagonal}
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>{label}</Text>
          </LinearGradient>
        </View>
      ) : (
        <View style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 16, opacity: 0.45 }}>{label}</Text>
        </View>
      )}
    </View>
  );
}

function BrandHeader() {
  return (
    <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.5 }}>
      Routine<Text style={{ color: colors.gold[400] }}>X</Text>
    </Text>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 1,
          letterSpacing: 0.3,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(24,24,27,0.95)',
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          height: 82,
          paddingBottom: 26,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1 }}>
            <LinearGradient
              colors={gradients.brand}
              {...gradientProps.leftToRight}
              style={{ height: 1.5, opacity: 0.5 }}
            />
            <View style={{ flex: 1, backgroundColor: 'rgba(24,24,27,0.95)' }} />
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
        headerTitle: () => <BrandHeader />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: () => <BrandHeader />,
          tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} />,
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
        name="admin"
        options={{
          title: 'Admin',
          headerTitle: () => (
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>
              Admin Portal
            </Text>
          ),
          tabBarIcon: ({ focused }) => <TabIcon label="⚙️" focused={focused} />,
          href: isAdmin ? undefined : null, // Hide tab for non-admins
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: () => <BrandHeader />,
          tabBarIcon: ({ focused }) => <TabIcon label="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
