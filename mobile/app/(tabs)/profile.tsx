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
import { colors, gradients, gradientProps } from '../../lib/theme';

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
      'To delete your account and all associated data, please contact us at 22tucker22@comcast.net. We will process your request within 48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: () => {
            Linking.openURL(
              `mailto:22tucker22@comcast.net?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20RoutineX%20account.%0A%0AEmail:%20${user?.email}`
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface[950] }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Profile Card with gradient accent */}
      <View
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <LinearGradient
          colors={gradients.brand}
          {...gradientProps.leftToRight}
          style={{ height: 3 }}
        />
        <View style={{ backgroundColor: colors.cardBg, padding: 20 }}>
          {/* Avatar with gradient */}
          <View style={{ width: 56, height: 56, borderRadius: 28, overflow: 'hidden', marginBottom: 12 }}>
            <LinearGradient
              colors={[colors.primary[600], colors.primary[400]]}
              {...gradientProps.diagonal}
              style={{
                width: 56, height: 56,
                justifyContent: 'center', alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </Text>
            </LinearGradient>
          </View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
            {user?.email || 'Not signed in'}
          </Text>
          <Text style={{ color: colors.textTertiary, fontSize: 13, marginTop: 4 }}>
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
      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 }}>
        Privacy & Data
      </Text>
      <View
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <TouchableOpacity
          onPress={() => Linking.openURL('https://routinex.org/privacy')}
          style={menuItemStyle}
        >
          <Text style={{ color: '#d4d4d8', fontSize: 15 }}>Privacy Policy</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <View style={menuItemStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#d4d4d8', fontSize: 15 }}>Thumbnail Auto-Delete</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 2 }}>
              Images automatically removed within 24 hours
            </Text>
          </View>
          <Text style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>ON</Text>
        </View>

        <View style={dividerStyle} />

        <View style={menuItemStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#d4d4d8', fontSize: 15 }}>Anonymous AI Analysis</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 2 }}>
              Names are never sent to the AI
            </Text>
          </View>
          <Text style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>ON</Text>
        </View>

        <View style={dividerStyle} />

        <View style={menuItemStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#d4d4d8', fontSize: 15 }}>COPPA Consent</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 2 }}>
              Parental consent provided at signup
            </Text>
          </View>
          <Text style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>✓</Text>
        </View>
      </View>

      {/* About Section */}
      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 }}>
        About
      </Text>
      <View
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <View style={menuItemStyle}>
          <Text style={{ color: '#d4d4d8', fontSize: 15 }}>Version</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 14 }}>1.0.0</Text>
        </View>

        <View style={dividerStyle} />

        <TouchableOpacity
          onPress={() => Linking.openURL('mailto:22tucker22@comcast.net')}
          style={menuItemStyle}
        >
          <Text style={{ color: '#d4d4d8', fontSize: 15 }}>Contact Support</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <TouchableOpacity
          onPress={() => Linking.openURL('https://routinex.org')}
          style={menuItemStyle}
        >
          <Text style={{ color: '#d4d4d8', fontSize: 15 }}>Visit Website</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 }}>
        Account
      </Text>
      <View
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <TouchableOpacity onPress={handleSignOut} style={menuItemStyle}>
          <Text style={{ color: '#d4d4d8', fontSize: 15 }}>Sign Out</Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <TouchableOpacity onPress={handleDeleteAccount} style={menuItemStyle}>
          <Text style={{ color: colors.error, fontSize: 15 }}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const menuItemStyle = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  padding: 16,
};

const dividerStyle = {
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.06)',
  marginHorizontal: 16,
};
