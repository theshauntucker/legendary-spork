import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { colors, gradients, gradientProps } from '../../lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface[950] }}>
      {/* Decorative gradient blurs */}
      <View
        style={{
          position: 'absolute',
          top: -80,
          left: -60,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: 'rgba(147,51,234,0.15)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 120,
          right: -80,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: 'rgba(236,72,153,0.1)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          left: -40,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: 'rgba(245,158,11,0.08)',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ fontSize: 36, fontWeight: '800', color: '#fff' }}>
              Routine<Text style={{ color: colors.primary[400] }}>X</Text>
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 15 }}>
              Welcome back
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 16 }}>
            <View>
              <Text style={labelStyle}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="parent@example.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={inputStyle}
              />
            </View>

            <View>
              <Text style={labelStyle}>Password</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showPassword}
                  style={[inputStyle, { paddingRight: 50 }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: 14 }}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <Text style={{ color: colors.error, fontSize: 13, textAlign: 'center' }}>
                {error}
              </Text>
            ) : null}

            {/* Gradient Sign In button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              style={{ marginTop: 8, opacity: loading ? 0.6 : 1 }}
            >
              <LinearGradient
                colors={gradients.brand}
                {...gradientProps.diagonal}
                style={{
                  borderRadius: 999,
                  padding: 16,
                  alignItems: 'center',
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                    Sign In
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/signup')}
              style={{ alignItems: 'center', marginTop: 8 }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                Don't have an account?{' '}
                <Text style={{ color: colors.primary[400] }}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: colors.textTertiary, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
              By signing in, you agree to our{' '}
              <Text
                style={{ color: colors.primary[400], textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL('https://routinex.org/terms')}
              >
                Terms
              </Text>{' '}
              and{' '}
              <Text
                style={{ color: colors.primary[400], textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL('https://routinex.org/privacy')}
              >
                Privacy Policy
              </Text>
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 12 }}>
              Built by a dance dad.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const labelStyle = {
  color: '#d4d4d8',
  fontSize: 13,
  marginBottom: 6,
  fontWeight: '500' as const,
};

const inputStyle = {
  backgroundColor: 'rgba(255,255,255,0.07)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: 14,
  color: '#fff',
  fontSize: 15,
};
