import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getScoreHistory, ScoreHistoryPoint } from '../../lib/api';
import { colors, gradients, gradientProps, glass, glassElevated } from '../../lib/theme';

const awardConfig: Record<string, { color: string; icon: string }> = {
  Diamond: { color: '#fbbf24', icon: '💎' },
  Platinum: { color: '#a855f7', icon: '🏆' },
  'High Gold': { color: '#eab308', icon: '🥇' },
  Gold: { color: '#ca8a04', icon: '🏅' },
};

export default function DancerProfileScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const [history, setHistory] = useState<ScoreHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const dancerName = decodeURIComponent(name || '');

  useEffect(() => {
    if (!dancerName) return;
    loadData();
  }, [dancerName]);

  const loadData = async () => {
    try {
      const data = await getScoreHistory(dancerName);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load dancer data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface[950], justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary[400]} />
      </View>
    );
  }

  const initials = dancerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const allScores = history.map((h) => h.totalScore);
  const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
  const avgScore = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  // Count awards
  const awardCounts: Record<string, number> = {};
  history.forEach((h) => {
    awardCounts[h.awardLevel] = (awardCounts[h.awardLevel] || 0) + 1;
  });

  const styles = [...new Set(history.map((h) => h.style))];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface[950] }}>
      {/* Background blurs */}
      <View style={{ position: 'absolute', top: -40, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(147,51,234,0.08)' }} />

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ padding: 16, paddingTop: 56 }}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>← Back</Text>
      </TouchableOpacity>

      {/* Profile Header */}
      <View style={{ marginHorizontal: 16, overflow: 'hidden', borderRadius: 24 }}>
        <LinearGradient
          colors={['rgba(147,51,234,0.2)', 'rgba(236,72,153,0.1)']}
          {...gradientProps.diagonal}
          style={{
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {/* Avatar */}
            <View style={{ overflow: 'hidden', borderRadius: 18, width: 64, height: 64 }}>
              <LinearGradient
                colors={gradients.brand}
                {...gradientProps.diagonal}
                style={{
                  width: 64,
                  height: 64,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>{initials}</Text>
              </LinearGradient>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 }}>
                {dancerName}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {styles.map((style) => (
                  <View key={style} style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 999,
                    paddingVertical: 3,
                    paddingHorizontal: 10,
                  }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '500' }}>
                      {style}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Privacy badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 }}>
            <Text style={{ color: colors.success, fontSize: 10 }}>🔒 Your trophy room is private</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 10, margin: 16 }}>
        {[
          { label: 'Analyses', value: history.length, color: colors.primary[400] },
          { label: 'Best Score', value: bestScore, color: colors.gold[400] },
          { label: 'Avg Score', value: avgScore, color: colors.primary[400] },
        ].map((stat) => (
          <View key={stat.label} style={{ flex: 1, ...glass, padding: 14, alignItems: 'center' }}>
            <Text style={{ color: stat.color, fontSize: 22, fontWeight: '800' }}>{stat.value}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Trophy Case */}
      <View style={{ margin: 16 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 14, letterSpacing: -0.5 }}>
          Trophy Case
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(['Diamond', 'Platinum', 'High Gold', 'Gold'] as const).map((award) => {
            const count = awardCounts[award] || 0;
            const config = awardConfig[award] || { color: '#ca8a04', icon: '🏅' };
            return (
              <View
                key={award}
                style={{
                  flex: 1,
                  ...glass,
                  padding: 14,
                  alignItems: 'center',
                  opacity: count > 0 ? 1 : 0.3,
                }}
              >
                <Text style={{ fontSize: 20 }}>{config.icon}</Text>
                <Text style={{ color: config.color, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
                  {count}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 9, marginTop: 2 }}>{award}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Score Progress (simple bar chart) */}
      {history.length >= 2 && (
        <View style={{ margin: 16 }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 14, letterSpacing: -0.5 }}>
            Score Progress
          </Text>
          <View style={{ ...glassElevated, padding: 18 }}>
            {history.slice(-5).map((point, i) => {
              const pct = ((point.totalScore - 255) / 50) * 100;
              const config = awardConfig[point.awardLevel] || { color: '#ca8a04' };
              return (
                <TouchableOpacity
                  key={point.videoId}
                  onPress={() => router.push(`/analysis/${point.videoId}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: i < history.slice(-5).length - 1 ? 12 : 0 }}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 10, width: 40 }}>
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  <View style={{ flex: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
                    <LinearGradient
                      colors={gradients.scoreBar}
                      {...gradientProps.leftToRight}
                      style={{ height: 20, borderRadius: 10, width: `${Math.max(10, pct)}%`, justifyContent: 'center', paddingLeft: 8 }}
                    >
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{point.totalScore}</Text>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* All Analyses List */}
      <View style={{ margin: 16 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 14, letterSpacing: -0.5 }}>
          All Analyses
        </Text>
        {[...history].reverse().map((entry) => {
          const config = awardConfig[entry.awardLevel] || { color: '#ca8a04' };
          return (
            <TouchableOpacity
              key={entry.videoId}
              onPress={() => router.push(`/analysis/${entry.videoId}`)}
              style={{ ...glass, flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10 }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{entry.routineName}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {entry.style} · {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: config.color, fontSize: 20, fontWeight: '800' }}>{entry.totalScore}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{entry.awardLevel}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom CTA */}
      <View style={{ alignItems: 'center', padding: 24, paddingBottom: 48 }}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/upload')}
          activeOpacity={0.8}
          style={{ borderRadius: 999, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={gradients.brand}
            {...gradientProps.diagonal}
            style={{ borderRadius: 999, paddingVertical: 18, paddingHorizontal: 36 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              Analyze Another Routine
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
