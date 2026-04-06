import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BrandHeader from '../components/BrandHeader';
import { colors, gradientProps, glass, screenGradient } from '../lib/theme';

const faqs = [
  {
    q: "What happens to my dancer's video? Is it uploaded, stored, or sold?",
    a: "Your video never leaves your phone. RoutineX processes your video locally on your device. We extract small still-frame snapshots at key moments — those are what get analyzed. The full video is never uploaded, never stored on our servers, and never seen by any human.\n\nThe frames are automatically deleted within 24 hours of your analysis completing. You can delete them immediately from your results page — one tap and they're gone.\n\nWe don't sell data. We don't share videos. No human ever views your content. Period.\n\nYour child's privacy isn't an afterthought. It's how we built RoutineX from day one.",
  },
  {
    q: 'How does the AI analysis work?',
    a: 'RoutineX uses advanced AI trained on real competition judging rubrics from major organizations. When you upload a video, our AI evaluates technique, performance quality, choreography, and overall impression — the same categories judges use — and generates a detailed scorecard with actionable feedback in under 5 minutes.',
  },
  {
    q: 'What video formats and lengths are supported?',
    a: 'We accept MP4, MOV, AVI, and all standard video formats. Routines can be up to 10 minutes long. For best results, we recommend recording from a front-facing angle with good lighting, similar to how judges would view the performance.',
  },
  {
    q: 'How accurate is the scoring compared to real judges?',
    a: 'Our AI is trained on thousands of real competition scores and judging rubrics. While no AI replaces the nuance of a live judge, RoutineX provides consistent, unbiased feedback that closely mirrors competition scoring. Users report their RoutineX scores typically fall within 5-8 points of their actual competition scores.',
  },
  {
    q: 'Is this a replacement for judges or coaching?',
    a: "Not at all — RoutineX is a training tool, not a replacement. Think of it as having an extra set of expert eyes on every practice run. Use it between competitions and lessons to track progress, identify areas for improvement, and make the most of your studio time.",
  },
  {
    q: 'What age groups and styles does this work for?',
    a: 'RoutineX works for all competitive age divisions — Mini (5-6), Petite (6-9), Junior (9-12), Teen (12-15), and Senior (15-19). We support Jazz, Contemporary, Lyrical, Hip Hop, Tap, Ballet, Musical Theater, Pom, and Acro. Our AI adapts its scoring criteria to each style.',
  },
  {
    q: 'Can I use this for cheer routines too?',
    a: 'Yes! RoutineX analyzes cheer routines with the same level of detail, evaluating tumbling, stunts, formations, synchronization, and overall performance quality. It works for both All-Star and school cheer programs.',
  },
  {
    q: 'What does it cost?',
    a: 'Single analyses are $8.99 each, or grab our Competition Pack — 5 analyses for $29.99 (just $6 each). Follow us on Instagram @routinex.ai for occasional free analysis giveaways!',
  },
  {
    q: 'Can I get a refund?',
    a: "If you're not satisfied with your experience, reach out to us through the Contact page and we'll work with you. We want every dancer to get real value from RoutineX.",
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 48 }}>
        <BrandHeader showBack subtitle="FAQ" />

        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 24 }}>
          Questions? We've Got Answers.
        </Text>

        {faqs.map((faq, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setOpenIndex(openIndex === i ? null : i)}
            activeOpacity={0.7}
            style={{ ...glass, marginBottom: 10, overflow: 'hidden' }}
          >
            <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500', flex: 1, paddingRight: 12 }}>{faq.q}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 18 }}>{openIndex === i ? '−' : '+'}</Text>
            </View>
            {openIndex === i && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 21 }}>{faq.a}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
