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
  Switch,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { storeConsentRecord } from '../../lib/api';
import { colors, gradients, gradientProps } from '../../lib/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [parentConsent, setParentConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!parentConsent || !dataConsent) {
      setError('You must agree to both consent statements to create an account.');
      return;
    }

    setLoading(true);
    const { error: signUpError, data } = await signUp(email, password);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Store COPPA consent records
    if (data.user?.id) {
      try {
        await storeConsentRecord('coppa_parent', 'RoutineX Mobile App');
        await storeConsentRecord('coppa_data_processing', 'RoutineX Mobile App');
      } catch (err) {
        console.error('Failed to store consent records:', err);
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surface[950],
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        {/* Decorative blurs */}
        <View style={{ position: 'absolute', top: '30%', left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(147,51,234,0.12)' }} />
        <View style={{ position: 'absolute', bottom: '20%', right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(236,72,153,0.08)' }} />

        <View style={{
          width: 72, height: 72, borderRadius: 36,
          justifyContent: 'center', alignItems: 'center', marginBottom: 20,
          overflow: 'hidden',
        }}>
          <LinearGradient
            colors={gradients.brand}
            {...gradientProps.diagonal}
            style={{ width: 72, height: 72, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 32, color: '#fff', fontWeight: '800' }}>✓</Text>
          </LinearGradient>
        </View>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
          Account Created!
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
          Check your email for a confirmation link, then sign in to start analyzing routines.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradients.brand}
            {...gradientProps.diagonal}
            style={{ borderRadius: 999, paddingVertical: 14, paddingHorizontal: 32 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              Go to Login
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface[950] }}>
      {/* Decorative gradient blurs */}
      <View style={{ position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(147,51,234,0.12)' }} />
      <View style={{ position: 'absolute', top: 200, left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(236,72,153,0.08)' }} />
      <View style={{ position: 'absolute', bottom: 60, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(245,158,11,0.06)' }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 36, fontWeight: '800', color: '#fff' }}>
              Routine<Text style={{ color: colors.primary[400] }}>X</Text>
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 15 }}>
              Create your account
            </Text>
          </View>

          <View style={{ gap: 14 }}>
            {/* Email */}
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

            {/* Password */}
            <View>
              <Text style={labelStyle}>Password</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
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

            {/* Confirm Password */}
            <View>
              <Text style={labelStyle}>Confirm Password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat your password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
                style={inputStyle}
              />
            </View>

            {/* COPPA Consent */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingTop: 16,
                marginTop: 8,
              }}
            >
              <Text style={{ color: colors.success, fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
                Parental Consent (Required)
              </Text>

              <TouchableOpacity
                onPress={() => setParentConsent(!parentConsent)}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}
              >
                <Switch
                  value={parentConsent}
                  onValueChange={setParentConsent}
                  trackColor={{ false: '#27272a', true: '#7c3aed' }}
                  thumbColor={parentConsent ? '#a855f7' : '#52525b'}
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
                <Text style={{ color: '#d4d4d8', fontSize: 13, flex: 1, lineHeight: 18 }}>
                  I am the parent or legal guardian of any minor whose dance/cheer
                  routines will be submitted for analysis through RoutineX.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDataConsent(!dataConsent)}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
              >
                <Switch
                  value={dataConsent}
                  onValueChange={setDataConsent}
                  trackColor={{ false: '#27272a', true: '#7c3aed' }}
                  thumbColor={dataConsent ? '#a855f7' : '#52525b'}
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
                <Text style={{ color: '#d4d4d8', fontSize: 13, flex: 1, lineHeight: 18 }}>
                  I consent to the temporary processing of still-frame images
                  extracted from my child's routine video by our AI analysis
                  provider (Anthropic). These images are analyzed anonymously and
                  automatically deleted within 24 hours.
                </Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <Text style={{ color: colors.error, fontSize: 13, textAlign: 'center' }}>
                {error}
              </Text>
            ) : null}

            {/* Gradient Create Account button */}
            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
              style={{ marginTop: 8, opacity: loading ? 0.6 : 1 }}
            >
              <LinearGradient
                colors={gradients.brand}
                {...gradientProps.diagonal}
                style={{ borderRadius: 999, padding: 16, alignItems: 'center' }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                    Create Account
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={{ alignItems: 'center', marginTop: 8 }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                Already have an account?{' '}
                <Text style={{ color: colors.primary[400] }}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Info Section */}
          <View style={{
            marginTop: 24,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
          }}>
            <Text style={{ color: colors.primary[400], fontSize: 13, fontWeight: '600', marginBottom: 12 }}>
              Your Privacy Matters
            </Text>

            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 14 }}>🔒</Text>
                <Text style={{ color: '#d4d4d8', fontSize: 12, flex: 1 }}>
                  Videos are never sold or shared
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 14 }}>📱</Text>
                <Text style={{ color: '#d4d4d8', fontSize: 12, flex: 1 }}>
                  Only thumbnail frames leave your device
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 14 }}>🗑️</Text>
                <Text style={{ color: '#d4d4d8', fontSize: 12, flex: 1 }}>
                  Frames auto-delete within 24 hours
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 14 }}>👤</Text>
                <Text style={{ color: '#d4d4d8', fontSize: 12, flex: 1 }}>
                  Names anonymized during AI analysis
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://routinex.org/privacy')}
              style={{ marginTop: 12 }}
            >
              <Text style={{ color: colors.primary[400], fontSize: 12, textDecorationLine: 'underline' }}>
                Read our full Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
            <Text style={{ color: colors.textTertiary, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
              By signing up, you agree to our{' '}
              <Text
                style={{ color: colors.primary[400], textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL('https://routinex.org/terms')}
              >
                Terms of Service
              </Text>.
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 8 }}>
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
