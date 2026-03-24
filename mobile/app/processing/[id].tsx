import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAnalysis } from '../../lib/api';

const POLL_INTERVAL = 5000; // 5 seconds

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

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Cycle through steps for visual progress
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Poll for analysis completion
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
        // Still processing — keep polling
      }
    }, POLL_INTERVAL);

    return () => clearInterval(poll);
  }, [id, router]);

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
      {/* Animated pulse ring */}
      <View style={{ marginBottom: 32, alignItems: 'center' }}>
        <Animated.View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: 'rgba(168,85,247,0.15)',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: pulseAnim,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(168,85,247,0.25)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color="#a855f7" />
          </View>
        </Animated.View>
      </View>

      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
        Analyzing Your Routine
      </Text>
      <Text style={{ color: '#9ca3af', fontSize: 14, marginBottom: 32 }}>
        This usually takes 1-2 minutes
      </Text>

      {/* Progress steps */}
      <View style={{ width: '100%', maxWidth: 280 }}>
        {STEPS.map((stepText, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
              opacity: i <= currentStep ? 1 : 0.3,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: i < currentStep ? '#10b981' : i === currentStep ? '#7c3aed' : '#27272a',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {i < currentStep ? (
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
              ) : i === currentStep ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: '#6b7280', fontSize: 11 }}>{i + 1}</Text>
              )}
            </View>
            <Text
              style={{
                color: i <= currentStep ? '#fff' : '#6b7280',
                fontSize: 14,
                fontWeight: i === currentStep ? '600' : '400',
              }}
            >
              {stepText}
            </Text>
          </View>
        ))}
      </View>

      {error ? (
        <Text style={{ color: '#f87171', fontSize: 13, marginTop: 24, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}

      <View
        style={{
          backgroundColor: 'rgba(16,185,129,0.1)',
          borderRadius: 12,
          padding: 12,
          marginTop: 32,
          borderWidth: 1,
          borderColor: 'rgba(16,185,129,0.2)',
        }}
      >
        <Text style={{ color: '#6ee7b7', fontSize: 12, textAlign: 'center', lineHeight: 17 }}>
          🔒 Names are anonymized during analysis. Your video never leaves your device.
        </Text>
      </View>
    </View>
  );
}
