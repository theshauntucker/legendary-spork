import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, gradients, gradientProps, glass, glassElevated, sectionGradient } from '../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FAQS_PREVIEW = [
  {
    q: 'What happens to my video?',
    a: 'Your video never leaves your phone. We extract small still-frame snapshots at key moments for AI analysis. Frames auto-delete within 24 hours.',
  },
  {
    q: 'How accurate is the scoring?',
    a: 'Our AI is trained on real competition judging rubrics. Users report scores typically within 5-8 points of actual competition results.',
  },
  {
    q: 'What styles and ages does this work for?',
    a: 'All competitive age divisions (Mini through Senior) and styles including Jazz, Contemporary, Lyrical, Hip Hop, Tap, Ballet, Acro, Pom, and Cheer.',
  },
  {
    q: 'Can I get a refund?',
    a: "If you're not satisfied, reach out through the Contact page and we'll work with you. We want every dancer to get real value from RoutineX.",
  },
];

export default function LandingScreen() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface[950] }}>
      {/* Hero Section */}
      <LinearGradient
        colors={['rgba(147,51,234,0.35)', 'rgba(236,72,153,0.15)', 'rgba(245,158,11,0.05)', colors.surface[950]]}
        {...gradientProps.topToBottom}
        style={{ paddingTop: 80, paddingBottom: 40, paddingHorizontal: 24 }}
      >
        {/* Decorative blurs */}
        <View style={{ position: 'absolute', top: -40, left: -60, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(147,51,234,0.30)' }} />
        <View style={{ position: 'absolute', top: 140, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(236,72,153,0.20)' }} />
        <View style={{ position: 'absolute', bottom: 40, left: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(245,158,11,0.12)' }} />

        <Text style={{ fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1.5, textAlign: 'center' }}>
          Routine<Text style={{ color: colors.primary[400] }}>X</Text>
        </Text>

        <Text style={{ fontSize: 18, color: colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 26 }}>
          AI-Powered Dance Routine Analysis
        </Text>

        <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22, maxWidth: 320, alignSelf: 'center' }}>
          Get competition-standard scoring, timestamped feedback, and a personalized improvement roadmap in under 5 minutes.
        </Text>

        {/* CTA Buttons */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.8}
          style={{
            borderRadius: 999,
            overflow: 'hidden',
            marginTop: 28,
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
            style={{ borderRadius: 999, paddingVertical: 18, paddingHorizontal: 36, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>
              Get Started
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={{ alignItems: 'center', marginTop: 16 }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Already have an account? <Text style={{ color: colors.primary[400], fontWeight: '600' }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Privacy Trust Badge */}
      <View style={{ marginHorizontal: 24, marginTop: 8 }}>
        <View style={{
          ...glass,
          borderColor: 'rgba(16,185,129,0.25)',
          backgroundColor: 'rgba(16,185,129,0.06)',
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
          <Text style={{ fontSize: 20 }}>🔒</Text>
          <Text style={{ color: colors.successLight, fontSize: 13, flex: 1, lineHeight: 19 }}>
            Your video never leaves your device. Only still-frame thumbnails are analyzed by AI.
          </Text>
        </View>
      </View>

      {/* How It Works */}
      <View style={{ padding: 24, paddingTop: 36 }}>
        <Text style={{ color: colors.primary[400], fontSize: 12, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center' }}>
          Simple Process
        </Text>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 8, letterSpacing: -0.5 }}>
          How RoutineX Works
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
          From upload to actionable feedback in under 5 minutes.
        </Text>

        {[
          { icon: '📱', title: 'Upload Your Routine', desc: 'Record or select a video from your library. MP4, MOV, and all standard formats up to 10 minutes.', color: 'rgba(147,51,234,0.15)' },
          { icon: '🧠', title: 'AI Analyzes Everything', desc: 'Our AI scores technique, performance quality, choreography, and overall impression in under 5 minutes.', color: 'rgba(236,72,153,0.12)' },
          { icon: '📊', title: 'Get Detailed Feedback', desc: 'Full scorecard with per-category breakdowns, timestamped notes, and prioritized improvement roadmap.', color: 'rgba(245,158,11,0.10)' },
        ].map((step, i) => (
          <View key={i} style={{ ...glassElevated, padding: 20, marginTop: 14, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
            <View style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: step.color,
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Text style={{ fontSize: 24 }}>{step.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{step.title}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 19 }}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Pricing Section */}
      <LinearGradient
        colors={sectionGradient as unknown as string[]}
        {...gradientProps.topToBottom}
        style={{ padding: 24, paddingTop: 36, paddingBottom: 40 }}
      >
        <Text style={{ color: colors.primary[400], fontSize: 12, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center' }}>
          Pricing
        </Text>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 8, letterSpacing: -0.5 }}>
          Simple, Honest Pricing
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
          A private coaching session costs $75+. RoutineX gives you detailed feedback for a fraction of the price.
        </Text>

        {/* Free First Analysis */}
        <View style={{
          ...glass,
          borderColor: 'rgba(16,185,129,0.30)',
          borderWidth: 1,
          padding: 22,
          marginTop: 20,
        }}>
          <View style={{
            position: 'absolute', top: -12, left: 20,
            borderRadius: 999, overflow: 'hidden',
            backgroundColor: 'rgba(16,185,129,0.20)',
            paddingVertical: 4, paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: 'rgba(16,185,129,0.40)',
          }}>
            <Text style={{ color: colors.freeGreenLight, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>FREE</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 4 }}>First Analysis</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
            <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800' }}>$0</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>1 analysis</Text>
          </View>
          <Text style={{ color: colors.freeGreenLight, fontSize: 13, fontWeight: '600', marginTop: 4 }}>
            Try RoutineX risk-free
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>
            Sign up and get your first full AI analysis on us. No credit card required.
          </Text>
          {['1 full AI analysis', 'Competition-standard scoring', 'Timestamped judge notes', 'Improvement roadmap', 'Results in under 5 minutes'].map((item) => (
            <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <Text style={{ color: colors.freeGreen, fontSize: 12 }}>✓</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item}</Text>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.8}
            style={{
              borderRadius: 999,
              marginTop: 18,
              paddingVertical: 14,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: colors.freeGreen,
              backgroundColor: 'rgba(16,185,129,0.10)',
            }}
          >
            <Text style={{ color: colors.freeGreenLight, fontWeight: '700', fontSize: 15 }}>
              Sign Up Free
            </Text>
          </TouchableOpacity>
        </View>

        {/* BOGO Launch Offer */}
        <View style={{
          ...glass,
          borderColor: 'rgba(236,72,153,0.30)',
          borderWidth: 1,
          padding: 22,
          marginTop: 20,
        }}>
          <View style={{
            position: 'absolute', top: -12, left: 20,
            borderRadius: 999, overflow: 'hidden',
          }}>
            <LinearGradient
              colors={[colors.accent[500], colors.accent[600]]}
              {...gradientProps.leftToRight}
              style={{ paddingVertical: 4, paddingHorizontal: 14, borderRadius: 999 }}
            >
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>BOGO LAUNCH</Text>
            </LinearGradient>
          </View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 4 }}>2 Analyses</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
            <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800' }}>$8.99</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>2 analyses</Text>
          </View>
          <Text style={{ color: colors.accent[400], fontSize: 13, fontWeight: '600', marginTop: 4 }}>
            Buy one, get one free!
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>
            2 full AI analyses for any routine. Competition-standard scoring and detailed feedback.
          </Text>
          {['2 full AI analyses', 'Competition-standard scoring', 'Timestamped judge notes', 'Improvement roadmap', 'Results in under 5 minutes'].map((item) => (
            <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <Text style={{ color: colors.primary[400], fontSize: 12 }}>✓</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Competition Pack */}
        <View style={{
          ...glass,
          borderColor: 'rgba(147,51,234,0.30)',
          borderWidth: 1,
          padding: 22,
          marginTop: 14,
        }}>
          <View style={{
            position: 'absolute', top: -12, left: 20,
            borderRadius: 999, overflow: 'hidden',
          }}>
            <LinearGradient
              colors={gradients.brand}
              {...gradientProps.leftToRight}
              style={{ paddingVertical: 4, paddingHorizontal: 14, borderRadius: 999 }}
            >
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>POPULAR</Text>
            </LinearGradient>
          </View>

          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 4 }}>Competition Pack</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
            <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800' }}>$29.99</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>5 analyses</Text>
          </View>
          <Text style={{ color: colors.primary[400], fontSize: 13, fontWeight: '600', marginTop: 4 }}>
            Only $6/analysis — save $15 vs buying singles
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>
            5 full AI analyses. Use them on different routines or track the same routine week by week.
          </Text>
          {['5 full AI analyses included', 'Competition-standard scoring (Gold to Diamond)', 'Timestamped notes on every key moment', 'Technique, Performance & Choreography scores', 'Prioritized improvement roadmap', 'Results in under 5 minutes'].map((item) => (
            <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <Text style={{ color: colors.primary[400], fontSize: 12 }}>✓</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item}</Text>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.8}
            style={{ borderRadius: 999, overflow: 'hidden', marginTop: 18 }}
          >
            <LinearGradient
              colors={gradients.brand}
              {...gradientProps.diagonal}
              style={{ borderRadius: 999, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                Get Started
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Monthly Subscription — BEST VALUE */}
        <View style={{
          ...glass,
          borderColor: 'rgba(245,158,11,0.40)',
          borderWidth: 2,
          padding: 22,
          marginTop: 14,
          shadowColor: colors.gold[500],
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}>
          <View style={{
            position: 'absolute', top: -12, left: 20,
            borderRadius: 999, overflow: 'hidden',
          }}>
            <LinearGradient
              colors={[colors.gold[500], colors.accent[500], colors.primary[500]]}
              {...gradientProps.leftToRight}
              style={{ paddingVertical: 4, paddingHorizontal: 14, borderRadius: 999 }}
            >
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>⭐ BEST VALUE</Text>
            </LinearGradient>
          </View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 4 }}>Pro Monthly</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
            <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800' }}>$12.99</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>/month</Text>
          </View>
          <Text style={{ color: colors.gold[400], fontSize: 13, fontWeight: '600', marginTop: 4 }}>
            10 analyses every month — only $1.30 each
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>
            Best value for serious dancers. Track multiple routines all season long. Cancel anytime in Settings.
          </Text>
          {['10 AI analyses per month', 'Unused credits roll over', 'Competition-standard scoring', 'Full progress tracking & trophy room', 'Priority processing', 'Cancel anytime — no commitment'].map((item) => (
            <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <Text style={{ color: colors.gold[400], fontSize: 12 }}>✓</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item}</Text>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.8}
            style={{ borderRadius: 999, overflow: 'hidden', marginTop: 18 }}
          >
            <LinearGradient
              colors={[colors.gold[500], colors.accent[500], colors.primary[600]]}
              {...gradientProps.diagonal}
              style={{ borderRadius: 999, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                Start Pro Monthly
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={{ color: colors.textTertiary, fontSize: 10, textAlign: 'center', marginTop: 8, lineHeight: 14 }}>
            Auto-renews monthly at $12.99. Cancel anytime in your Apple ID subscription settings.
          </Text>
        </View>

        {/* Value comparison */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginTop: 20 }}>
          <Text style={{ color: colors.textTertiary, fontSize: 12, textDecorationLine: 'line-through' }}>Private lesson: $75-$150/hr</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 12, textDecorationLine: 'line-through' }}>Competition entry: $80-$120</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 8 }}>
          RoutineX: <Text style={{ color: colors.freeGreenLight }}>start FREE</Text>, then from <Text style={{ color: colors.gold[400] }}>$1.30/analysis</Text> with Pro Monthly
        </Text>
      </LinearGradient>

      {/* FAQ Preview */}
      <View style={{ padding: 24, paddingTop: 36 }}>
        <Text style={{ color: colors.primary[400], fontSize: 12, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center' }}>
          FAQ
        </Text>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 8, letterSpacing: -0.5 }}>
          Questions? We've Got Answers.
        </Text>

        {FAQS_PREVIEW.map((faq, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setOpenFaq(openFaq === i ? null : i)}
            activeOpacity={0.7}
            style={{ ...glass, marginTop: 10, overflow: 'hidden' }}
          >
            <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500', flex: 1, paddingRight: 12 }}>{faq.q}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>{openFaq === i ? '−' : '+'}</Text>
            </View>
            {openFaq === i && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>{faq.a}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer CTA */}
      <LinearGradient
        colors={sectionGradient as unknown as string[]}
        {...gradientProps.topToBottom}
        style={{ padding: 24, paddingTop: 36, paddingBottom: 60, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 }}>
          Ready to Improve?
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
          Join dancers across the country who use RoutineX to track their progress and level up their routines.
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.8}
          style={{
            borderRadius: 999,
            overflow: 'hidden',
            marginTop: 24,
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
            style={{ borderRadius: 999, paddingVertical: 18, paddingHorizontal: 40, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>
              Get Started
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 20 }}>
          Built by a dance dad.
        </Text>

        <View style={{ flexDirection: 'row', gap: 20, marginTop: 16 }}>
          <TouchableOpacity onPress={() => router.push('/privacy')}>
            <Text style={{ color: colors.textTertiary, fontSize: 12, textDecorationLine: 'underline' }}>Privacy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/terms')}>
            <Text style={{ color: colors.textTertiary, fontSize: 12, textDecorationLine: 'underline' }}>Terms</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/about')}>
            <Text style={{ color: colors.textTertiary, fontSize: 12, textDecorationLine: 'underline' }}>About</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}
