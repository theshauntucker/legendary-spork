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
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
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
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#fff' }}>
            Routine<Text style={{ color: '#a855f7' }}>X</Text>
          </Text>
          <Text style={{ color: '#9ca3af', marginTop: 8, fontSize: 15 }}>
            Welcome back
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 16 }}>
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

          <View>
            <Text style={{ color: '#d4d4d8', fontSize: 13, marginBottom: 6, fontWeight: '500' }}>
              Password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
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
                style={{
                  position: 'absolute',
                  right: 14,
                  top: 14,
                }}
              >
                <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={handleLogin}
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
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            style={{ alignItems: 'center', marginTop: 8 }}
          >
            <Text style={{ color: '#9ca3af', fontSize: 13 }}>
              Don't have an account?{' '}
              <Text style={{ color: '#a855f7' }}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
