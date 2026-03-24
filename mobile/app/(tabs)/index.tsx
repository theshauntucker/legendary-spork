import React, { useEffect, useState, useCallback } from 'react';
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
import { getUserAnalyses } from '../../lib/api';
import { colors, gradients, gradientProps } from '../../lib/theme';

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
        style={{ marginBottom: 12, borderRadius: 16, overflow: 'hidden' }}
      >
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* Gradient top accent bar */}
          <LinearGradient
            colors={gradients.brand}
            {...gradientProps.leftToRight}
            style={{ height: 3 }}
          />
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                  {title}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                  {item.dancer_name || 'Unknown'} · {item.dance_style || 'Dance'}
                </Text>
                <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 4 }}>
                  {formatDate(item.created_at)}
                </Text>
              </View>

              {isProcessing ? (
                <View style={{ alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.primary[500]} />
                  <Text style={{ color: colors.primary[500], fontSize: 11, marginTop: 4 }}>
                    Processing
                  </Text>
                </View>
              ) : score ? (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>
                    {score}
                  </Text>
                  <Text style={{ color: award!.color, fontSize: 11, fontWeight: '600' }}>
                    {award!.label}
                  </Text>
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
      <View style={{ flex: 1, backgroundColor: colors.surface[950], justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface[950] }}>
      <FlatList
        data={analyses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            {/* Decorative blur */}
            <View style={{ position: 'absolute', top: -20, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(147,51,234,0.08)' }} />

            <Text style={{ fontSize: 48, marginBottom: 16 }}>🎬</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
              No analyses yet
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
              Upload your first routine to get AI-powered scoring and feedback.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/upload')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.brand}
                {...gradientProps.diagonal}
                style={{ borderRadius: 999, paddingVertical: 14, paddingHorizontal: 28 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  Analyze a Routine
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
