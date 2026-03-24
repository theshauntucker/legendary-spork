import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAnalysis } from '../../lib/api';
import { colors, gradients, gradientProps, glass } from '../../lib/theme';

const POLL_INTERVAL = 5000;

const STEPS = [
  'Uploading frames...',
  'Analyzing technique...',
  'Evaluating performance...',
  'Scoring choreography...',
  'Generating feedback...',
  'Finalizing report...',
];

export default function ProcessingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Pulse + scale animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim, scaleAnim]);

  // Cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Poll for completion
  useEffect(() => {
    if (!id) return;

    const poll = setInterval(async () => {
      try {
        const data = await getAnalysis(id);
        if (data && (data as Record<string, unknown>).overallScore) {
          clearInterval(poll);
          router.replace(`/analysis/${id}`);
        }
      } catch {
        // Still processing
      }
    }, POLL_INTERVAL);

    return () => clearInterval(poll);
  }, [id, router]);

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.surface[950],
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    }}>
      {/* Background blurs */}
      <View style={{ position: 'absolute', top: '20%', right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(147,51,234,0.1)' }} />
      <View style={{ position: 'absolute', bottom: '25%', left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(236,72,153,0.06)' }} />

      {/* Animated pulse ring */}
      <View style={{ marginBottom: 36, alignItems: 'center' }}>
        <Animated.View
          style={{
            width: 130,
            height: 130,
            borderRadius: 65,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: pulseAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <LinearGradient
            colors={['rgba(147,51,234,0.2)', 'rgba(236,72,153,0.1)', 'rgba(245,158,11,0.05)']}
            {...gradientProps.diagonal}
            style={{
              width: 130,
              height: 130,
              borderRadius: 65,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(147,51,234,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(147,51,234,0.3)',
            }}>
              <ActivityIndicator size="large" color={colors.primary[400]} />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 }}>
        Analyzing Your Routine
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 36 }}>
        This usually takes 1-2 minutes
      </Text>

      {/* Progress steps */}
      <View style={{ ...glass, padding: 20, width: '100%', maxWidth: 320 }}>
        {STEPS.map((stepText, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              marginBottom: i < STEPS.length - 1 ? 14 : 0,
              opacity: i <= currentStep ? 1 : 0.3,
            }}
          >
            {i < currentStep ? (
              <View style={{ overflow: 'hidden', borderRadius: 12 }}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
                </LinearGradient>
              </View>
            ) : i === currentStep ? (
              <View style={{ overflow: 'hidden', borderRadius: 12 }}>
                <LinearGradient
                  colors={gradients.cardAccent}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator size="small" color="#fff" />
                </LinearGradient>
              </View>
            ) : (
              <View style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: 'rgba(255,255,255,0.06)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
              }}>
                <Text style={{ color: colors.textTertiary, fontSize: 11 }}>{i + 1}</Text>
              </View>
            )}
            <Text style={{
              color: i <= currentStep ? '#fff' : colors.textTertiary,
              fontSize: 14,
              fontWeight: i === currentStep ? '600' : '400',
            }}>
              {stepText}
            </Text>
          </View>
        ))}
      </View>

      {error ? (
        <View style={{
          backgroundColor: 'rgba(248,113,113,0.1)',
          borderRadius: 14,
          padding: 14,
          marginTop: 24,
          borderWidth: 1,
          borderColor: 'rgba(248,113,113,0.2)',
        }}>
          <Text style={{ color: colors.error, fontSize: 13, textAlign: 'center' }}>{error}</Text>
        </View>
      ) : null}

      <View style={{
        ...glass,
        borderColor: 'rgba(16,185,129,0.2)',
        backgroundColor: 'rgba(16,185,129,0.06)',
        padding: 14,
        marginTop: 32,
        width: '100%',
        maxWidth: 320,
      }}>
        <Text style={{ color: colors.successLight, fontSize: 12, textAlign: 'center', lineHeight: 17 }}>
          🔒 Names are anonymized during analysis. Your video never leaves your device.
        </Text>
      </View>
    </View>
  );
}
