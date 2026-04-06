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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { colors, gradients, gradientProps, inputStyle, labelStyle, screenGradient } from '../../lib/theme';

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
    <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1 }}>
      {/* Decorative gradient blurs — matching website hero */}
      <View style={{ position: 'absolute', top: -80, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(147,51,234,0.30)' }} />
      <View style={{ position: 'absolute', top: 140, right: -80, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(236,72,153,0.22)' }} />
      <View style={{ position: 'absolute', bottom: 80, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(245,158,11,0.14)' }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 28,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 44 }}>
            <Text style={{ fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1 }}>
              Routine<Text style={{ color: colors.primary[400], textShadowColor: 'rgba(168,85,247,0.6)', textShadowRadius: 16, textShadowOffset: { width: 0, height: 0 } }}>X</Text>
            </Text>
            <View style={{ marginTop: 14 }}>
              <LinearGradient
                colors={gradients.brand}
                {...gradientProps.leftToRight}
                style={{ height: 2, width: 60, borderRadius: 1, alignSelf: 'center', opacity: 0.6, marginBottom: 14 }}
              />
              <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
                Welcome back
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={{ gap: 18 }}>
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
                  style={{ ...inputStyle, paddingRight: 54 }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 16, top: 16 }}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <View style={{
                backgroundColor: 'rgba(248,113,113,0.1)',
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: 'rgba(248,113,113,0.2)',
              }}>
                <Text style={{ color: colors.error, fontSize: 13, textAlign: 'center' }}>{error}</Text>
              </View>
            ) : null}

            {/* Gradient Sign In button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              style={{
                marginTop: 8,
                opacity: loading ? 0.6 : 1,
                borderRadius: 999,
                overflow: 'hidden',
                shadowColor: colors.primary[500],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={gradients.brand}
                {...gradientProps.diagonal}
                style={{
                  borderRadius: 999,
                  padding: 18,
                  alignItems: 'center',
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>
                    Sign In
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/signup')}
              style={{ alignItems: 'center', marginTop: 10 }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Don't have an account?{' '}
                <Text style={{ color: colors.primary[400], fontWeight: '600' }}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: 44 }}>
            <Text style={{ color: colors.textTertiary, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
              By signing in, you agree to our{' '}
              <Text
                style={{ color: colors.primary[400], textDecorationLine: 'underline' }}
                onPress={() => router.push('/terms')}
              >
                Terms
              </Text>{' '}
              and{' '}
              <Text
                style={{ color: colors.primary[400], textDecorationLine: 'underline' }}
                onPress={() => router.push('/privacy')}
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
    </LinearGradient>
  );
}
