import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAnalysis, deleteFrames } from '../../lib/api';

interface JudgeScore {
  category: string;
  score: number;
  maxScore: number;
  feedback: string;
  styleNotes?: string;
}

interface TimelineNote {
  timestamp: number;
  note: string;
  type: 'strength' | 'improvement' | 'technique' | 'performance';
}

interface ImprovementPriority {
  rank: number;
  item: string;
  trainingTip: string;
  impact: 'high' | 'medium' | 'low';
}

interface AnalysisResult {
  overallScore: number;
  judgeScores: JudgeScore[];
  timelineNotes: TimelineNote[];
  improvementPriorities: ImprovementPriority[];
  framesDeleted?: boolean;
}

function getAwardLevel(score: number) {
  if (score >= 290) return { label: 'Titanium', color: '#fbbf24' };
  if (score >= 280) return { label: 'Platinum Star', color: '#a855f7' };
  if (score >= 265) return { label: 'Platinum', color: '#d4d4d8' };
  if (score >= 250) return { label: 'High Gold', color: '#eab308' };
  return { label: 'Gold', color: '#ca8a04' };
}

function getImpactColor(impact: string) {
  if (impact === 'high') return '#f87171';
  if (impact === 'medium') return '#fbbf24';
  return '#6ee7b7';
}

function getNoteColor(type: string) {
  if (type === 'strength') return '#10b981';
  if (type === 'improvement') return '#fbbf24';
  if (type === 'technique') return '#a855f7';
  return '#60a5fa';
}

export default function AnalysisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [framesDeleted, setFramesDeleted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      const result = await getAnalysis(id!);
      setData(result as unknown as AnalysisResult);
      setFramesDeleted(!!(result as Record<string, unknown>).framesDeleted);
    } catch (err) {
      console.error('Failed to load analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFrames = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteFrames(id);
      setFramesDeleted(true);
      setShowDeleteModal(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to delete frames. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Analysis not found
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#a855f7', fontSize: 15 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const award = getAwardLevel(data.overallScore);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Privacy Banner */}
      <View
        style={{
          backgroundColor: framesDeleted ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',
          margin: 16,
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          borderColor: 'rgba(16,185,129,0.2)',
        }}
      >
        <Text style={{ color: '#6ee7b7', fontSize: 13, lineHeight: 18 }}>
          {framesDeleted
            ? '🔒 Thumbnails deleted — All images permanently removed from our servers.'
            : '🛡️ Thumbnails auto-delete within 24 hours. You can delete them now below.'}
        </Text>
      </View>

      {/* Score Header */}
      <View
        style={{
          marginHorizontal: 16,
          borderRadius: 20,
          padding: 24,
          backgroundColor: 'rgba(124,58,237,0.15)',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          RoutineX Analysis Report
        </Text>
        <Text style={{ color: '#fff', fontSize: 56, fontWeight: '800', marginTop: 8 }}>
          {data.overallScore}
        </Text>
        <Text style={{ color: '#9ca3af', fontSize: 14 }}>out of 300</Text>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 999,
            paddingVertical: 4,
            paddingHorizontal: 16,
            marginTop: 8,
          }}
        >
          <Text style={{ color: award.color, fontSize: 13, fontWeight: '700' }}>
            {award.label}
          </Text>
        </View>
      </View>

      {/* Judge Scores */}
      <View style={{ margin: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
          Score Breakdown
        </Text>
        {data.judgeScores.map((score) => (
          <View
            key={score.category}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 14,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                {score.category}
              </Text>
              <Text style={{ color: '#a855f7', fontSize: 15, fontWeight: '700' }}>
                {score.score}/{score.maxScore}
              </Text>
            </View>
            {/* Score bar */}
            <View style={{ height: 4, backgroundColor: '#27272a', borderRadius: 2, marginBottom: 10 }}>
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#a855f7',
                  width: `${(score.score / score.maxScore) * 100}%`,
                }}
              />
            </View>
            <Text style={{ color: '#9ca3af', fontSize: 13, lineHeight: 19 }}>
              {score.feedback}
            </Text>
          </View>
        ))}
      </View>

      {/* Timeline Notes */}
      {data.timelineNotes && data.timelineNotes.length > 0 && (
        <View style={{ margin: 16 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Performance Timeline
          </Text>
          {data.timelineNotes.map((note, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                gap: 10,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 10,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: getNoteColor(note.type),
                  marginTop: 5,
                }}
              />
              <Text style={{ color: '#d4d4d8', fontSize: 13, flex: 1, lineHeight: 19 }}>
                {note.note}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Improvement Priorities */}
      {data.improvementPriorities && data.improvementPriorities.length > 0 && (
        <View style={{ margin: 16 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Improvement Roadmap
          </Text>
          {data.improvementPriorities.map((item) => (
            <View
              key={item.rank}
              style={{
                flexDirection: 'row',
                gap: 12,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                alignItems: 'flex-start',
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#7c3aed',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
                  {item.rank}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                  {item.item}
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                  {item.trainingTip}
                </Text>
                <View
                  style={{
                    backgroundColor: getImpactColor(item.impact) + '20',
                    borderRadius: 999,
                    paddingVertical: 2,
                    paddingHorizontal: 8,
                    alignSelf: 'flex-start',
                    marginTop: 6,
                  }}
                >
                  <Text style={{ color: getImpactColor(item.impact), fontSize: 11, fontWeight: '600' }}>
                    {item.impact.toUpperCase()} IMPACT
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Delete Frames Button */}
      {!framesDeleted && (
        <View style={{ margin: 16 }}>
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.2)',
              borderRadius: 12,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#f87171', fontSize: 14, fontWeight: '600' }}>
              Delete Thumbnails Now
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom CTA */}
      <View style={{ alignItems: 'center', padding: 24, paddingBottom: 48 }}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/upload')}
          style={{
            backgroundColor: '#9333ea',
            borderRadius: 999,
            paddingVertical: 16,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            Analyze Another Routine
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: '#18181b',
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
              Delete Thumbnails?
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, lineHeight: 20, marginBottom: 20 }}>
              This will permanently delete all thumbnail images from our servers.
              Your analysis report will still be available. This cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#d4d4d8', fontWeight: '600' }}>Keep</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteFrames}
                disabled={deleting}
                style={{
                  flex: 1,
                  backgroundColor: '#dc2626',
                  borderRadius: 12,
                  padding: 14,
                  alignItems: 'center',
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
