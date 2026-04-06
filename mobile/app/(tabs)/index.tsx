import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getUserAnalyses, getUserCredits, UserCredits } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors, gradients, gradientProps, glass, glassElevated, screenGradient, CARD_ACCENT_HEIGHT } from '../../lib/theme';

interface AnalysisItem {
  id: string;
  routine_title: string;
  dancer_name: string;
  dance_style: string;
  status: string;
  analysis_data?: {
    overallScore?: number;
  };
  created_at: string;
}

interface DancerSummary {
  name: string;
  bestScore: number;
  bestAward: ReturnType<typeof getAwardLevel>;
  analysisCount: number;
  styles: string[];
}

function getAwardLevel(score: number) {
  if (score >= 295) return { label: 'Diamond', color: '#60a5fa' };
  if (score >= 290) return { label: 'Titanium', color: '#fbbf24' };
  if (score >= 280) return { label: 'Platinum Star', color: '#a855f7' };
  if (score >= 265) return { label: 'Platinum', color: '#d4d4d8' };
  if (score >= 250) return { label: 'High Gold', color: '#eab308' };
  return { label: 'Gold', color: '#ca8a04' };
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [credits, setCredits] = useState<UserCredits>({ remaining: 0, total: 0, used: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [analysesData, creditsData] = await Promise.all([
        getUserAnalyses(),
        getUserCredits(),
      ]);
      setAnalyses(analysesData as unknown as AnalysisItem[]);
      setCredits(creditsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // Build dancer summaries from analyses
  const dancers = useMemo(() => {
    const map: Record<string, DancerSummary> = {};
    for (const a of analyses) {
      const name = a.dancer_name;
      if (!name || a.status !== 'analyzed' || !a.analysis_data?.overallScore) continue;
      if (!map[name]) {
        map[name] = { name, bestScore: 0, bestAward: getAwardLevel(0), analysisCount: 0, styles: [] };
      }
      const d = map[name];
      const score = a.analysis_data.overallScore;
      if (score > d.bestScore) {
        d.bestScore = score;
        d.bestAward = getAwardLevel(score);
      }
      d.analysisCount++;
      if (!d.styles.includes(a.dance_style)) {
        d.styles.push(a.dance_style);
      }
    }
    return Object.values(map);
  }, [analyses]);

  const recentAnalyses = analyses.slice(0, 5);

  const renderAnalysisItem = ({ item }: { item: AnalysisItem }) => {
    const score = item.analysis_data?.overallScore;
    const award = score ? getAwardLevel(score) : null;
    const isProcessing = item.status === 'processing';
    const title = item.routine_title || item.dance_style || 'Untitled Routine';

    return (
      <TouchableOpacity
        onPress={() => {
          if (isProcessing) {
            router.push(`/processing/${item.id}`);
          } else {
            router.push(`/analysis/${item.id}`);
          }
        }}
        activeOpacity={0.7}
        style={{ marginBottom: 12 }}
      >
        <View style={{ ...glass, overflow: 'hidden' }}>
          <LinearGradient colors={gradients.brand} {...gradientProps.leftToRight} style={{ height: CARD_ACCENT_HEIGHT }} />
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, marginRight: 14 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: -0.3 }}>{title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                  {item.dancer_name || 'Unknown'} · {item.dance_style || 'Dance'}
                </Text>
                <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}>
                  {formatDate(item.created_at)}
                </Text>
              </View>

              {isProcessing ? (
                <View style={{ alignItems: 'center', backgroundColor: 'rgba(147,51,234,0.15)', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 }}>
                  <ActivityIndicator size="small" color={colors.primary[400]} />
                  <Text style={{ color: colors.primary[400], fontSize: 9, marginTop: 3, fontWeight: '600' }}>Analyzing</Text>
                </View>
              ) : score ? (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.gold[400], fontSize: 28, fontWeight: '800', letterSpacing: -1 }}>{score}</Text>
                  <View style={{ backgroundColor: award!.color + '30', borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8, marginTop: 2 }}>
                    <Text style={{ color: award!.color, fontSize: 9, fontWeight: '700' }}>{award!.label.toUpperCase()}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(147,51,234,0.20)', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary[400]} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1 }}>
      {/* Background decorative blurs */}
      <View style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(147,51,234,0.18)' }} />
      <View style={{ position: 'absolute', bottom: 120, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(236,72,153,0.14)' }} />
      <View style={{ position: 'absolute', top: 250, left: '35%', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(245,158,11,0.10)' }} />

      <FlatList
        data={recentAnalyses}
        keyExtractor={(item) => item.id}
        renderItem={renderAnalysisItem}
        contentContainerStyle={{ padding: 16, paddingTop: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[400]} />
        }
        ListHeaderComponent={
          <View>
            {/* Credits Bar */}
            {credits.total > 0 && (
              <View style={{ ...glass, borderColor: 'rgba(16,185,129,0.25)', backgroundColor: 'rgba(16,185,129,0.06)', padding: 14, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.successLight, fontSize: 14, fontWeight: '600' }}>
                  {credits.remaining} credit{credits.remaining !== 1 ? 's' : ''} remaining
                </Text>
                <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
                  {credits.used} used of {credits.total}
                </Text>
              </View>
            )}

            {/* Your Dancers Section */}
            {dancers.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: colors.primary[400], fontSize: 12, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 }}>
                  Your Dancers
                </Text>
                {dancers.map((dancer) => (
                  <TouchableOpacity
                    key={dancer.name}
                    onPress={() => router.push(`/dancer/${encodeURIComponent(dancer.name)}`)}
                    activeOpacity={0.7}
                    style={{ marginBottom: 10 }}
                  >
                    <View style={{ ...glassElevated, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      {/* Avatar */}
                      <View style={{ overflow: 'hidden', borderRadius: 14, width: 48, height: 48 }}>
                        <LinearGradient
                          colors={gradients.brand}
                          {...gradientProps.diagonal}
                          style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}
                        >
                          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>
                            {dancer.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </Text>
                        </LinearGradient>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{dancer.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                            {dancer.analysisCount} {dancer.analysisCount === 1 ? 'analysis' : 'analyses'}
                          </Text>
                          <Text style={{ color: colors.textTertiary, fontSize: 10 }}>·</Text>
                          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                            {dancer.styles.slice(0, 2).join(', ')}
                          </Text>
                        </View>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: dancer.bestAward.color, fontSize: 22, fontWeight: '800' }}>{dancer.bestScore}</Text>
                        <View style={{ backgroundColor: dancer.bestAward.color + '25', borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8, marginTop: 2 }}>
                          <Text style={{ color: dancer.bestAward.color, fontSize: 8, fontWeight: '700' }}>
                            {dancer.bestAward.label.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recent Analyses Header */}
            {analyses.length > 0 && (
              <View style={{ marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: colors.primary[400], fontSize: 12, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginLeft: 4 }}>
                  Recent Analyses
                </Text>
                <View style={{ overflow: 'hidden', borderRadius: 8 }}>
                  <LinearGradient
                    colors={gradients.brand}
                    {...gradientProps.diagonal}
                    style={{ paddingVertical: 2, paddingHorizontal: 7, borderRadius: 8 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{analyses.length}</Text>
                  </LinearGradient>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            {/* Decorative gradient circle */}
            <View style={{ width: 100, height: 100, borderRadius: 50, overflow: 'hidden', marginBottom: 24 }}>
              <LinearGradient
                colors={[...gradients.brand]}
                {...gradientProps.diagonal}
                style={{ width: 100, height: 100, justifyContent: 'center', alignItems: 'center', opacity: 0.2 }}
              >
                <Text style={{ fontSize: 40, opacity: 1 }}>✨</Text>
              </LinearGradient>
            </View>

            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8, letterSpacing: -0.5 }}>
              Welcome to RoutineX
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 28, lineHeight: 22, maxWidth: 280 }}>
              Upload your first routine to get AI-powered competition scoring and feedback.
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/upload')}
              activeOpacity={0.8}
              style={{ borderRadius: 999, overflow: 'hidden' }}
            >
              <LinearGradient
                colors={gradients.brand}
                {...gradientProps.diagonal}
                style={{ borderRadius: 999, paddingVertical: 16, paddingHorizontal: 36 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                  Analyze a Routine
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Trust badges */}
            <View style={{ marginTop: 32, gap: 12, alignItems: 'center' }}>
              {[
                { icon: '🛡️', text: 'Competition-Calibrated Scoring' },
                { icon: '⚡', text: 'Results in Minutes' },
                { icon: '🔒', text: 'Video Never Leaves Your Device' },
              ].map((badge) => (
                <View key={badge.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13 }}>{badge.icon}</Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 12 }}>{badge.text}</Text>
                </View>
              ))}
            </View>
          </View>
        }
      />
    </LinearGradient>
  );
}
