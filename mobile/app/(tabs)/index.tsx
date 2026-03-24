import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getUserAnalyses } from '../../lib/api';
import { colors, gradients, gradientProps, glass } from '../../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalyses = useCallback(async () => {
    try {
      const data = await getUserAnalyses();
      setAnalyses(data as unknown as AnalysisItem[]);
    } catch (err) {
      console.error('Failed to load analyses:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalyses();
  }, [loadAnalyses]);

  const renderItem = ({ item }: { item: AnalysisItem }) => {
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
        style={{ marginBottom: 14 }}
      >
        <View style={{ ...glass, overflow: 'hidden' }}>
          {/* Gradient top accent */}
          <LinearGradient
            colors={gradients.brand}
            {...gradientProps.leftToRight}
            style={{ height: 2 }}
          />
          <View style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: -0.3 }}>
                  {title}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>
                  {item.dancer_name || 'Unknown'} · {item.dance_style || 'Dance'}
                </Text>
                <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 4 }}>
                  {formatDate(item.created_at)}
                </Text>
              </View>

              {isProcessing ? (
                <View style={{
                  alignItems: 'center',
                  backgroundColor: 'rgba(147,51,234,0.15)',
                  borderRadius: 14,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                }}>
                  <ActivityIndicator size="small" color={colors.primary[400]} />
                  <Text style={{ color: colors.primary[400], fontSize: 10, marginTop: 4, fontWeight: '600' }}>
                    Analyzing
                  </Text>
                </View>
              ) : score ? (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -1 }}>
                    {score}
                  </Text>
                  <View style={{
                    backgroundColor: award!.color + '20',
                    borderRadius: 999,
                    paddingVertical: 3,
                    paddingHorizontal: 10,
                    marginTop: 4,
                  }}>
                    <Text style={{ color: award!.color, fontSize: 10, fontWeight: '700' }}>
                      {award!.label.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Score progress bar */}
            {score && (
              <View style={{ marginTop: 14 }}>
                <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={gradients.scoreBar}
                    {...gradientProps.leftToRight}
                    style={{
                      height: 4,
                      borderRadius: 2,
                      width: `${(score / 300) * 100}%`,
                    }}
                  />
                </View>
                <Text style={{ color: colors.textTertiary, fontSize: 10, marginTop: 4, textAlign: 'right' }}>
                  {score} / 300
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface[950], justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: 'rgba(147,51,234,0.15)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <ActivityIndicator size="large" color={colors.primary[400]} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface[950] }}>
      {/* Background decorative blurs */}
      <View style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(147,51,234,0.08)' }} />
      <View style={{ position: 'absolute', bottom: 100, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(236,72,153,0.05)' }} />

      <FlatList
        data={analyses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[400]}
          />
        }
        ListHeaderComponent={
          analyses.length > 0 ? (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                {analyses.length} routine{analyses.length !== 1 ? 's' : ''} analyzed
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            {/* Decorative gradient circle */}
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              overflow: 'hidden',
              marginBottom: 24,
            }}>
              <LinearGradient
                colors={[...gradients.brand]}
                {...gradientProps.diagonal}
                style={{
                  width: 100,
                  height: 100,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: 0.2,
                }}
              >
                <Text style={{ fontSize: 40, opacity: 1 }}>✨</Text>
              </LinearGradient>
            </View>

            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8, letterSpacing: -0.5 }}>
              No analyses yet
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
                style={{
                  borderRadius: 999,
                  paddingVertical: 16,
                  paddingHorizontal: 36,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                  Analyze a Routine
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Trust badges */}
            <View style={{ marginTop: 32, gap: 12, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 13 }}>🛡️</Text>
                <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Competition-Calibrated Scoring</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 13 }}>⚡</Text>
                <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Results in Minutes</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 13 }}>🔒</Text>
                <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Video Never Leaves Your Device</Text>
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
}
