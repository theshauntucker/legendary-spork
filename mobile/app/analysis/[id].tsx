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
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAnalysis, deleteFrames, getCompetitionScores, CompetitionScoreData } from '../../lib/api';
import { colors, gradients, gradientProps, glass, glassElevated, screenGradient, CARD_ACCENT_HEIGHT } from '../../lib/theme';
import { CompetitionScoreSection } from '../../components/CompetitionScoreForm';

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
  if (score >= 295) return { label: 'Diamond', color: '#60a5fa' };
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
  const [competitionScores, setCompetitionScores] = useState<CompetitionScoreData[]>([]);

  useEffect(() => {
    if (!id) return;
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      const result = await getAnalysis(id!);
      setData(result as unknown as AnalysisResult);
      setFramesDeleted(!!(result as unknown as Record<string, unknown>).framesDeleted);
      // Load competition scores
      const resultAny = result as unknown as Record<string, unknown>;
      if (resultAny.analysisId) {
        const scores = await getCompetitionScores(resultAny.analysisId as string);
        setCompetitionScores(scores);
      }
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
      <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          width: 64, height: 64, borderRadius: 32,
          backgroundColor: 'rgba(147,51,234,0.20)',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <ActivityIndicator size="large" color={colors.primary[400]} />
        </View>
      </LinearGradient>
    );
  }

  if (!data) {
    return (
      <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          Analysis not found
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary[400], fontSize: 15 }}>Go back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const award = getAwardLevel(data.overallScore);

  return (
    <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1 }}>
    <ScrollView style={{ flex: 1 }}>
      {/* Background blurs */}
      <View style={{ position: 'absolute', top: -40, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(147,51,234,0.20)' }} />
      <View style={{ position: 'absolute', top: 300, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(236,72,153,0.12)' }} />
      <View style={{ position: 'absolute', top: 600, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(245,158,11,0.08)' }} />

      {/* Privacy Banner */}
      <View style={{
        ...glass,
        borderColor: 'rgba(16,185,129,0.25)',
        backgroundColor: framesDeleted ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.06)',
        margin: 16,
        padding: 14,
      }}>
        <Text style={{ color: colors.successLight, fontSize: 13, lineHeight: 18 }}>
          {framesDeleted
            ? '🔒 Thumbnails deleted — All images permanently removed from our servers.'
            : '🛡️ Thumbnails auto-delete within 24 hours. You can delete them now below.'}
        </Text>
      </View>

      {/* Score Header — matches website's glass preview card */}
      <View style={{ marginHorizontal: 16, overflow: 'hidden', borderRadius: 24 }}>
        <LinearGradient
          colors={['rgba(147,51,234,0.30)', 'rgba(236,72,153,0.15)', 'rgba(245,158,11,0.08)']}
          {...gradientProps.diagonal}
          style={{
            borderRadius: 24,
            padding: 28,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <Text style={{ color: colors.gold[400], fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>
            RoutineX Analysis Report
          </Text>
          <Text style={{ color: '#fff', fontSize: 64, fontWeight: '800', marginTop: 8, letterSpacing: -2 }}>
            {data.overallScore}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: -2 }}>out of 300</Text>

          {/* Award badge */}
          <View style={{
            backgroundColor: award.color + '20',
            borderRadius: 999,
            paddingVertical: 6,
            paddingHorizontal: 20,
            marginTop: 12,
            borderWidth: 1,
            borderColor: award.color + '30',
          }}>
            <Text style={{ color: award.color, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>
              {award.label}
            </Text>
          </View>

          {/* Overall progress bar */}
          <View style={{ width: '100%', marginTop: 20 }}>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <LinearGradient
                colors={gradients.brand}
                {...gradientProps.leftToRight}
                style={{
                  height: 6,
                  borderRadius: 3,
                  width: `${(data.overallScore / 300) * 100}%`,
                }}
              />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Judge Scores */}
      <View style={{ margin: 16, marginTop: 24 }}>
        <Text style={{ color: colors.primary[400], fontSize: 20, fontWeight: '800', marginBottom: 14, letterSpacing: -0.5 }}>
          Score Breakdown
        </Text>
        {data.judgeScores.map((score) => (
          <View key={score.category} style={{ ...glassElevated, overflow: 'hidden', marginBottom: 12 }}>
            <LinearGradient
              colors={gradients.scoreBar}
              {...gradientProps.leftToRight}
              style={{ height: CARD_ACCENT_HEIGHT }}
            />
            <View style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {score.category}
              </Text>
              <Text style={{ color: colors.primary[400], fontSize: 16, fontWeight: '700' }}>
                {score.score}/{score.maxScore}
              </Text>
            </View>
            {/* Gradient score bar */}
            <View style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
              <LinearGradient
                colors={gradients.scoreBar}
                {...gradientProps.leftToRight}
                style={{
                  height: 5,
                  borderRadius: 3,
                  width: `${(score.score / score.maxScore) * 100}%`,
                }}
              />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 21 }}>
              {score.feedback}
            </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Timeline Notes */}
      {data.timelineNotes && data.timelineNotes.length > 0 && (
        <View style={{ margin: 16 }}>
          <Text style={{ color: colors.primary[400], fontSize: 20, fontWeight: '800', marginBottom: 14, letterSpacing: -0.5 }}>
            Performance Timeline
          </Text>
          {data.timelineNotes.map((note, i) => (
            <View key={i} style={{
              ...glass,
              flexDirection: 'row',
              gap: 12,
              padding: 16,
              marginBottom: 10,
            }}>
              <View style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: getNoteColor(note.type),
                marginTop: 4,
              }} />
              <Text style={{ color: '#e4e4e7', fontSize: 14, flex: 1, lineHeight: 21 }}>
                {note.note}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Improvement Priorities */}
      {data.improvementPriorities && data.improvementPriorities.length > 0 && (
        <View style={{ margin: 16 }}>
          <Text style={{ color: colors.primary[400], fontSize: 20, fontWeight: '800', marginBottom: 14, letterSpacing: -0.5 }}>
            Improvement Roadmap
          </Text>
          {data.improvementPriorities.map((item) => (
            <View key={item.rank} style={{
              ...glassElevated,
              flexDirection: 'row',
              gap: 14,
              padding: 18,
              marginBottom: 12,
              alignItems: 'flex-start',
            }}>
              <View style={{ overflow: 'hidden', borderRadius: 14, width: 32, height: 32 }}>
                <LinearGradient
                  colors={gradients.cardAccent}
                  {...gradientProps.diagonal}
                  style={{
                    width: 32,
                    height: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>
                    {item.rank}
                  </Text>
                </LinearGradient>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                  {item.item}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 5, lineHeight: 19 }}>
                  {item.trainingTip}
                </Text>
                <View style={{
                  backgroundColor: getImpactColor(item.impact) + '20',
                  borderRadius: 999,
                  paddingVertical: 3,
                  paddingHorizontal: 10,
                  alignSelf: 'flex-start',
                  marginTop: 8,
                }}>
                  <Text style={{ color: getImpactColor(item.impact), fontSize: 10, fontWeight: '700' }}>
                    {item.impact.toUpperCase()} IMPACT
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Competition Scores */}
      <CompetitionScoreSection
        scores={competitionScores}
        aiScore={data.overallScore}
        analysisId={id!}
        videoId={id!}
        onScoresChange={setCompetitionScores}
      />

      {/* Delete Frames Button */}
      {!framesDeleted && (
        <View style={{ margin: 16 }}>
          <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
            <View style={{
              ...glass,
              borderColor: 'rgba(239,68,68,0.2)',
              backgroundColor: 'rgba(239,68,68,0.06)',
              padding: 16,
              alignItems: 'center',
            }}>
              <Text style={{ color: colors.error, fontSize: 14, fontWeight: '600' }}>
                Delete Thumbnails Now
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

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
            style={{
              borderRadius: 999,
              paddingVertical: 18,
              paddingHorizontal: 36,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              Analyze Another Routine
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.75)',
          justifyContent: 'center',
          padding: 24,
        }}>
          <View style={{
            ...glassElevated,
            backgroundColor: colors.surface[900],
            padding: 28,
          }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 10, letterSpacing: -0.3 }}>
              Delete Thumbnails?
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 24 }}>
              This will permanently delete all thumbnail images from our servers. Your analysis report will still be available.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{
                  flex: 1,
                  ...glass,
                  padding: 16,
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
                  backgroundColor: colors.errorDark,
                  borderRadius: 20,
                  padding: 16,
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
    </LinearGradient>
  );
}
