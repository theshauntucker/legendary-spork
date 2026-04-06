import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, gradients, gradientProps, glass, screenGradient } from '../lib/theme';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1 }}>
      {/* Decorative blurs */}
      <View style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(147,51,234,0.20)' }} />
      <View style={{ position: 'absolute', top: 400, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(245,158,11,0.10)' }} />

      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 48 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: colors.primary[400], fontSize: 12, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
          Our Story
        </Text>
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -0.5 }}>
          Built by a Dance Dad.
        </Text>
        <Text style={{ color: colors.primary[400], fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 }}>
          For Every Dancer.
        </Text>

        {/* Founder Story */}
        <View style={{ ...glass, padding: 22, marginTop: 24 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', lineHeight: 24 }}>
            My name is Shaun Tucker. I'm not a choreographer. I'm not a judge. I'm a dance dad — and that's exactly why I built this.
          </Text>

          <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 14 }}>
            I've sat in hundreds of competition bleachers watching my daughter pour everything she has into a two-minute routine. I've seen her walk off that stage not knowing if she nailed it or missed something critical.
          </Text>

          <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 10 }}>
            These young dancers train year-round. They sacrifice weekends, holidays, and social lives to perfect their craft. They deserve more than a ribbon and a score sheet.
          </Text>

          <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 10 }}>
            They deserve to know what a judge actually thinks. What they did brilliantly. What's holding them back. And most importantly — what to focus on next.
          </Text>

          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', lineHeight: 22, marginTop: 10 }}>
            RoutineX is that feedback. Professional, specific, and honest — delivered in minutes, not days.
          </Text>
        </View>

        {/* More Than a Score */}
        <View style={{ ...glass, borderColor: 'rgba(147,51,234,0.20)', padding: 22, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Text style={{ fontSize: 20 }}>💜</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>More Than a Score</Text>
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
            These analyses aren't just numbers. They're a motivating source of feedback for young dancers — something real to hold onto, study, and work toward.
          </Text>

          <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 10 }}>
            When a 14-year-old reads that her arabesque showed "beautiful port de bras with consistent épaulement" — she knows exactly what to bring to her next rehearsal. That kind of specific, encouraging feedback is what separates dancers who plateau from dancers who keep growing.
          </Text>
        </View>

        {/* Under $9 */}
        <View style={{ ...glass, padding: 22, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Text style={{ fontSize: 20 }}>💰</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Under $9 for What Used to Cost $100+</Text>
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
            A single private lesson with a qualified instructor costs $75-$150. Getting feedback from a competition judge? Even more. RoutineX gives you detailed, competition-standard analysis for just $8.99 — or $6 per analysis with the Competition Pack.
          </Text>
        </View>

        {/* Values */}
        <View style={{ marginTop: 28 }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 16, letterSpacing: -0.3 }}>
            What We Stand For
          </Text>
          {[
            { icon: '🎯', title: 'Honest Feedback', desc: 'Real, specific, actionable — not empty praise. We tell dancers what they need to hear to improve.' },
            { icon: '💜', title: 'Built with Love', desc: 'RoutineX was built by a parent who understands the dedication these families put in every week.' },
            { icon: '⭐', title: 'For Every Dancer', desc: 'Whether you compete regionally or nationally, from Mini to Senior — everyone deserves quality feedback.' },
          ].map((value) => (
            <View key={value.title} style={{ ...glass, padding: 18, marginBottom: 10, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 24 }}>{value.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{value.title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 4 }}>{value.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Privacy First */}
        <View style={{ ...glass, borderColor: 'rgba(16,185,129,0.25)', backgroundColor: 'rgba(16,185,129,0.06)', padding: 22, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Text style={{ fontSize: 20 }}>🔒</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Your Child's Privacy Comes First</Text>
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
            Your video never leaves your device. Names are anonymized before AI analysis. Frames auto-delete within 24 hours. We're COPPA compliant and built privacy in from day one — not as an afterthought.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
