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
import { colors, gradients, gradientProps, glass, inputStyle, labelStyle, screenGradient } from '../../lib/theme';

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
      <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 28,
      }}>
        <View style={{ position: 'absolute', top: '25%', left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(147,51,234,0.25)' }} />
        <View style={{ position: 'absolute', bottom: '20%', right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(236,72,153,0.15)' }} />

        <View style={{ width: 80, height: 80, borderRadius: 24, overflow: 'hidden', marginBottom: 24 }}>
          <LinearGradient
            colors={gradients.brand}
            {...gradientProps.diagonal}
            style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 36, color: '#fff', fontWeight: '800' }}>✓</Text>
          </LinearGradient>
        </View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 10, letterSpacing: -0.5 }}>
          Account Created!
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 28, lineHeight: 22 }}>
          Check your email for a confirmation link, then sign in to start analyzing routines.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.8}
          style={{ borderRadius: 999, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={gradients.brand}
            {...gradientProps.diagonal}
            style={{ borderRadius: 999, paddingVertical: 16, paddingHorizontal: 36 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              Go to Login
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1 }}>
      {/* Decorative gradient blurs */}
      <View style={{ position: 'absolute', top: -60, right: -40, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(147,51,234,0.28)' }} />
      <View style={{ position: 'absolute', top: 220, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(236,72,153,0.18)' }} />
      <View style={{ position: 'absolute', bottom: 60, right: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(245,158,11,0.12)' }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 28, paddingTop: 64 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <Text style={{ fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1 }}>
              Routine<Text style={{ color: colors.primary[400], textShadowColor: 'rgba(168,85,247,0.6)', textShadowRadius: 16, textShadowOffset: { width: 0, height: 0 } }}>X</Text>
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 10, fontSize: 16 }}>
              Create your account
            </Text>
          </View>

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
                  placeholder="At least 8 characters"
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
            <View style={{
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.08)',
              paddingTop: 18,
              marginTop: 4,
            }}>
              <Text style={{ color: colors.success, fontSize: 14, fontWeight: '700', marginBottom: 14 }}>
                Parental Consent (Required)
              </Text>

              <TouchableOpacity
                onPress={() => setParentConsent(!parentConsent)}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}
              >
                <Switch
                  value={parentConsent}
                  onValueChange={setParentConsent}
                  trackColor={{ false: '#27272a', true: colors.primary[700] }}
                  thumbColor={parentConsent ? colors.primary[400] : '#52525b'}
                  style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                />
                <Text style={{ color: '#d4d4d8', fontSize: 13, flex: 1, lineHeight: 19 }}>
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
                  trackColor={{ false: '#27272a', true: colors.primary[700] }}
                  thumbColor={dataConsent ? colors.primary[400] : '#52525b'}
                  style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                />
                <Text style={{ color: '#d4d4d8', fontSize: 13, flex: 1, lineHeight: 19 }}>
                  I consent to the temporary processing of still-frame images
                  extracted from my child's routine video by our AI analysis
                  provider (Anthropic). These images are analyzed anonymously and
                  automatically deleted within 24 hours.
                </Text>
              </TouchableOpacity>
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

            {/* Gradient Create Account button */}
            <TouchableOpacity
              onPress={handleSignup}
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
                style={{ borderRadius: 999, padding: 18, alignItems: 'center' }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>
                    Create Account
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={{ alignItems: 'center', marginTop: 10 }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Already have an account?{' '}
                <Text style={{ color: colors.primary[400], fontWeight: '600' }}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Info Section */}
          <View style={{
            ...glass,
            borderColor: 'rgba(245,158,11,0.15)',
            padding: 20,
            marginTop: 28,
          }}>
            <Text style={{ color: colors.primary[400], fontSize: 14, fontWeight: '700', marginBottom: 14 }}>
              Your Privacy Matters
            </Text>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 14 }}>🔒</Text>
                <Text style={{ color: '#d4d4d8', fontSize: 13, flex: 1 }}>
                  Videos are never sold or shared
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 14 }}>📱</Text>
                <Text style={{ color: '#d4d4d8', fontSize: 13, flex: 1 }}>
                  Only thumbnail frames leave your device
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 14 }}>🗑️</Text>
                <Text style={{ color: '#d4d4d8', fontSize: 13, flex: 1 }}>
                  Frames auto-delete within 24 hours
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 14 }}>👤</Text>
                <Text style={{ color: '#d4d4d8', fontSize: 13, flex: 1 }}>
                  Names anonymized during AI analysis
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://routinex.org/privacy')}
              style={{ marginTop: 14 }}
            >
              <Text style={{ color: colors.primary[400], fontSize: 13, textDecorationLine: 'underline' }}>
                Read our full Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 40 }}>
            <Text style={{ color: colors.textTertiary, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
              By signing up, you agree to our{' '}
              <Text
                style={{ color: colors.primary[400], textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL('https://routinex.org/terms')}
              >
                Terms of Service
              </Text>.
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 10 }}>
              Built by a dance dad.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
