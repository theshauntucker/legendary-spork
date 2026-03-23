import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';

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
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Profile Card */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#7c3aed',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>
            {user?.email?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
          {user?.email || 'Not signed in'}
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
          Member since{' '}
          {user?.created_at
            ? new Date(user.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })
            : 'Unknown'}
        </Text>
      </View>

      {/* Privacy Section */}
      <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 }}>
        Privacy & Data
      </Text>
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
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
          <Text style={{ color: '#6b7280', fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <View style={menuItemStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#d4d4d8', fontSize: 15 }}>Thumbnail Auto-Delete</Text>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
              Images automatically removed within 24 hours
            </Text>
          </View>
          <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '600' }}>ON</Text>
        </View>

        <View style={dividerStyle} />

        <View style={menuItemStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#d4d4d8', fontSize: 15 }}>Anonymous AI Analysis</Text>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
              Names are never sent to the AI
            </Text>
          </View>
          <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '600' }}>ON</Text>
        </View>

        <View style={dividerStyle} />

        <View style={menuItemStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#d4d4d8', fontSize: 15 }}>COPPA Consent</Text>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
              Parental consent provided at signup
            </Text>
          </View>
          <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '600' }}>✓</Text>
        </View>
      </View>

      {/* About Section */}
      <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 }}>
        About
      </Text>
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <View style={menuItemStyle}>
          <Text style={{ color: '#d4d4d8', fontSize: 15 }}>Version</Text>
          <Text style={{ color: '#6b7280', fontSize: 14 }}>1.0.0</Text>
        </View>

        <View style={dividerStyle} />

        <TouchableOpacity
          onPress={() => Linking.openURL('mailto:22tucker22@comcast.net')}
          style={menuItemStyle}
        >
          <Text style={{ color: '#d4d4d8', fontSize: 15 }}>Contact Support</Text>
          <Text style={{ color: '#6b7280', fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <TouchableOpacity
          onPress={() => Linking.openURL('https://routinex.org')}
          style={menuItemStyle}
        >
          <Text style={{ color: '#d4d4d8', fontSize: 15 }}>Visit Website</Text>
          <Text style={{ color: '#6b7280', fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 }}>
        Account
      </Text>
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
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
          <Text style={{ color: '#f87171', fontSize: 15 }}>Delete Account</Text>
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
