import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { colors, gradients, gradientProps, glass, sectionHeader, screenGradient, CARD_ACCENT_HEIGHT } from '../../lib/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'To delete your account and all associated data, please contact us at danceroutinex@gmail.com. We will process your request within 48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: () => {
            Linking.openURL(
              `mailto:danceroutinex@gmail.com?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20RoutineX%20account.%0A%0AEmail:%20${user?.email}`
            );
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1 }}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      {/* Background blurs */}
      <View style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(147,51,234,0.28)' }} />
      <View style={{ position: 'absolute', bottom: 100, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(236,72,153,0.20)' }} />
      <View style={{ position: 'absolute', top: 300, left: '50%', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(245,158,11,0.12)' }} />

      {/* Profile Card */}
      <View style={{ ...glass, overflow: 'hidden', marginBottom: 24 }}>
        <LinearGradient
          colors={gradients.brand}
          {...gradientProps.leftToRight}
          style={{ height: CARD_ACCENT_HEIGHT }}
        />
        <View style={{ padding: 24 }}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 18,
            overflow: 'hidden',
            marginBottom: 16,
            shadowColor: colors.primary[600],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
          }}>
            <LinearGradient
              colors={[colors.primary[600], colors.accent[500]]}
              {...gradientProps.diagonal}
              style={{
                width: 60, height: 60,
                justifyContent: 'center', alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </Text>
            </LinearGradient>
          </View>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: -0.3 }}>
            {user?.email || 'Not signed in'}
          </Text>
          <Text style={{ color: colors.textTertiary, fontSize: 13, marginTop: 6 }}>
            Member since{' '}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })
              : 'Unknown'}
          </Text>
        </View>
      </View>

      {/* Privacy Section */}
      <Text style={{ ...sectionHeader, color: colors.primary[400] }}>Privacy & Data</Text>
      <View style={{ ...glass, overflow: 'hidden', marginBottom: 24 }}>
        <TouchableOpacity
          onPress={() => router.push('/privacy')}
          style={menuItemStyle}
        >
          <Text style={{ color: '#e4e4e7', fontSize: 15, fontWeight: '500' }}>Privacy Policy</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <TouchableOpacity
          onPress={() => router.push('/terms')}
          style={menuItemStyle}
        >
          <Text style={{ color: '#e4e4e7', fontSize: 15, fontWeight: '500' }}>Terms of Service</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <View style={menuItemStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#e4e4e7', fontSize: 15, fontWeight: '500' }}>Thumbnail Auto-Delete</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 3 }}>
              Images automatically removed within 24 hours
            </Text>
          </View>
          <View style={{
            backgroundColor: 'rgba(16,185,129,0.15)',
            borderRadius: 999,
            paddingVertical: 3,
            paddingHorizontal: 10,
          }}>
            <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>ON</Text>
          </View>
        </View>

        <View style={dividerStyle} />

        <View style={menuItemStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#e4e4e7', fontSize: 15, fontWeight: '500' }}>Anonymous AI Analysis</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 3 }}>
              Names are never sent to the AI
            </Text>
          </View>
          <View style={{
            backgroundColor: 'rgba(16,185,129,0.15)',
            borderRadius: 999,
            paddingVertical: 3,
            paddingHorizontal: 10,
          }}>
            <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>ON</Text>
          </View>
        </View>

        <View style={dividerStyle} />

        <View style={menuItemStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#e4e4e7', fontSize: 15, fontWeight: '500' }}>COPPA Consent</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 3 }}>
              Parental consent provided at signup
            </Text>
          </View>
          <View style={{
            backgroundColor: 'rgba(16,185,129,0.15)',
            borderRadius: 999,
            paddingVertical: 3,
            paddingHorizontal: 10,
          }}>
            <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>✓</Text>
          </View>
        </View>
      </View>

      {/* About Section */}
      <Text style={{ ...sectionHeader, color: colors.primary[400] }}>About</Text>
      <View style={{ ...glass, overflow: 'hidden', marginBottom: 24 }}>
        <TouchableOpacity
          onPress={() => router.push('/about')}
          style={menuItemStyle}
        >
          <Text style={{ color: '#e4e4e7', fontSize: 15, fontWeight: '500' }}>About RoutineX</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <TouchableOpacity
          onPress={() => router.push('/faq')}
          style={menuItemStyle}
        >
          <Text style={{ color: '#e4e4e7', fontSize: 15, fontWeight: '500' }}>FAQ</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <TouchableOpacity
          onPress={() => Linking.openURL('mailto:danceroutinex@gmail.com')}
          style={menuItemStyle}
        >
          <Text style={{ color: '#e4e4e7', fontSize: 15, fontWeight: '500' }}>Contact Support</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <TouchableOpacity
          onPress={() => Linking.openURL('https://routinex.org')}
          style={menuItemStyle}
        >
          <Text style={{ color: '#e4e4e7', fontSize: 15, fontWeight: '500' }}>Visit Website</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <View style={menuItemStyle}>
          <Text style={{ color: '#e4e4e7', fontSize: 15, fontWeight: '500' }}>Version</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 14 }}>1.0.0</Text>
        </View>
      </View>

      {/* Purchases */}
      <Text style={{ ...sectionHeader, color: colors.primary[400] }}>Purchases</Text>
      <View style={{ ...glass, overflow: 'hidden', marginBottom: 24 }}>
        <TouchableOpacity
          onPress={() => Alert.alert('Restore Purchases', 'If you previously purchased credits, they are linked to your account and will be available after signing in.')}
          style={menuItemStyle}
        >
          <Text style={{ color: '#e4e4e7', fontSize: 15, fontWeight: '500' }}>Restore Purchases</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <Text style={{ ...sectionHeader, color: colors.primary[400] }}>Account</Text>
      <View style={{ ...glass, overflow: 'hidden', marginBottom: 24 }}>
        <TouchableOpacity onPress={handleSignOut} style={menuItemStyle}>
          <Text style={{ color: '#e4e4e7', fontSize: 15, fontWeight: '500' }}>Sign Out</Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <TouchableOpacity onPress={handleDeleteAccount} style={menuItemStyle}>
          <Text style={{ color: colors.error, fontSize: 15, fontWeight: '500' }}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}

const menuItemStyle = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  padding: 18,
};

const dividerStyle = {
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.06)',
  marginHorizontal: 18,
};
