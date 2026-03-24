import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getUserAnalyses } from '../../lib/api';

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
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              {item.routine_title || 'Untitled Routine'}
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>
              {item.dancer_name || 'Unknown'} • {item.dance_style || 'Dance'}
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
              {formatDate(item.created_at)}
            </Text>
          </View>

          {isProcessing ? (
            <View style={{ alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#a855f7" />
              <Text style={{ color: '#a855f7', fontSize: 11, marginTop: 4 }}>
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
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <FlatList
        data={analyses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#a855f7"
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🎬</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
              No analyses yet
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
              Upload your first routine to get AI-powered scoring and feedback.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/upload')}
              style={{
                backgroundColor: '#9333ea',
                borderRadius: 999,
                paddingVertical: 14,
                paddingHorizontal: 28,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                Analyze a Routine
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
