import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BrandHeader from '../components/BrandHeader';
import { colors, gradientProps, screenGradient } from '../lib/theme';

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly: your name, email address, and payment information (processed securely by Stripe). When you use RoutineX, your video is processed on your device — the full video is never uploaded to our servers. We extract small still-frame thumbnails from your video, which are sent to our AI provider for analysis.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to provide and improve the Service, process payments, send transactional emails (account confirmation, analysis results), and communicate important updates about RoutineX.',
  },
  {
    title: '3. Video Content',
    body: 'Your full video never leaves your device. RoutineX extracts small still-frame thumbnails on your device, and only those frames are sent to our AI analysis provider (Anthropic) for scoring and feedback. Frames are automatically deleted within 24 hours of analysis completion, and you can request immediate deletion at any time. We do not sell, share, or publicly display your video or frames. No human ever views your video content.',
  },
  {
    title: '4. Third-Party Services',
    body: 'We use the following third-party services:\n\n• Supabase — authentication, database, and file storage\n• Stripe — payment processing\n• Anthropic (Claude) — AI video analysis\n• Vercel — hosting and infrastructure\n\nEach service has its own privacy policy. We only share the minimum data necessary for each service to function.',
  },
  {
    title: '5. Data Retention',
    body: 'We retain your account data and analysis results for as long as your account is active. You may request deletion of your account and all associated data at any time by contacting us.',
  },
  {
    title: "6. Children's Privacy & COPPA Compliance",
    body: "RoutineX processes videos of competitive dancers, many of whom are minors. We take children's privacy seriously and comply with the Children's Online Privacy Protection Act (COPPA).\n\nHow we protect minors:\n\n• We require verifiable parental/guardian consent before any video of a minor is submitted for analysis.\n• Video frames sent to our AI provider are used solely for dance analysis and are not used for training AI models.\n• Extracted frames are automatically deleted within 24 hours of analysis completion.\n• Users can request immediate deletion of frames at any time from their analysis results page.\n• We do not knowingly collect personal information from children under 13 without parental consent.\n• Dancer and studio names are anonymized before being sent to the AI provider for analysis.\n\nParental rights: Parents or guardians may review, request deletion of, or refuse further collection of their child's information at any time by contacting us at danceroutinex@gmail.com.\n\nIf we learn we have collected personal information from a child under 13 without verifiable parental consent, we will delete that information promptly.",
  },
  {
    title: '7. Security',
    body: 'We implement industry-standard security measures including encrypted data transmission (HTTPS/TLS), secure authentication, and row-level security in our database. However, no method of transmission over the internet is 100% secure.',
  },
  {
    title: '8. Your Rights',
    body: 'You have the right to access, correct, or delete your personal data. You may also request a copy of your data or withdraw consent for processing. To exercise these rights, contact us at the email below.',
  },
  {
    title: '9. Changes to This Policy',
    body: 'We may update this policy from time to time. We will notify you of material changes via email or through the Service.',
  },
  {
    title: '10. Contact',
    body: 'For privacy questions or data requests, email us at danceroutinex@gmail.com.',
  },
];

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 48 }}>
        <BrandHeader showBack subtitle="Privacy" />

        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 }}>
          Privacy Policy
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 24 }}>
          Effective Date: March 17, 2026
        </Text>

        {sections.map((section) => (
          <View key={section.title} style={{ marginBottom: 24 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
              {section.title}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
              {section.body}
            </Text>
          </View>
        ))}

        <TouchableOpacity onPress={() => Linking.openURL('mailto:danceroutinex@gmail.com')} style={{ marginTop: 8 }}>
          <Text style={{ color: colors.primary[400], fontSize: 14, textDecorationLine: 'underline' }}>
            danceroutinex@gmail.com
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}
