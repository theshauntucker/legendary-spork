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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { storeConsentRecord } from '../../lib/api';

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
          backgroundColor: '#0a0a0a',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>✓</Text>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
          Account Created!
        </Text>
        <Text style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
          Check your email for a confirmation link, then sign in to start analyzing routines.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          style={{
            backgroundColor: '#9333ea',
            borderRadius: 999,
            paddingVertical: 14,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            Go to Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#fff' }}>
            Routine<Text style={{ color: '#a855f7' }}>X</Text>
          </Text>
          <Text style={{ color: '#9ca3af', marginTop: 8, fontSize: 15 }}>
            Create your account
          </Text>
        </View>

        <View style={{ gap: 14 }}>
          {/* Email */}
          <View>
            <Text style={{ color: '#d4d4d8', fontSize: 13, marginBottom: 6, fontWeight: '500' }}>
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="parent@example.com"
              placeholderTextColor="#52525b"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: 14,
                color: '#fff',
                fontSize: 15,
              }}
            />
          </View>

          {/* Password */}
          <View>
            <Text style={{ color: '#d4d4d8', fontSize: 13, marginBottom: 6, fontWeight: '500' }}>
              Password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                placeholderTextColor="#52525b"
                secureTextEntry={!showPassword}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: 14,
                  paddingRight: 50,
                  color: '#fff',
                  fontSize: 15,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: 14 }}
              >
                <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View>
            <Text style={{ color: '#d4d4d8', fontSize: 13, marginBottom: 6, fontWeight: '500' }}>
              Confirm Password
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat your password"
              placeholderTextColor="#52525b"
              secureTextEntry={!showPassword}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: 14,
                color: '#fff',
                fontSize: 15,
              }}
            />
          </View>

          {/* COPPA Consent */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.1)',
              paddingTop: 16,
              marginTop: 8,
            }}
          >
            <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
              Parental Consent (Required)
            </Text>

            <TouchableOpacity
              onPress={() => setParentConsent(!parentConsent)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: 14,
              }}
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
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
              }}
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
            <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            style={{
              backgroundColor: '#9333ea',
              borderRadius: 999,
              padding: 16,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
              marginTop: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={{ alignItems: 'center', marginTop: 8, marginBottom: 40 }}
          >
            <Text style={{ color: '#9ca3af', fontSize: 13 }}>
              Already have an account?{' '}
              <Text style={{ color: '#a855f7' }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
