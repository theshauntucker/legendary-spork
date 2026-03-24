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
import { useAuth } from '../../lib/auth';

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

const MOCK_ANALYSES: Record<string, AnalysisResult & { title: string }> = {
  'preview-1': {
    title: 'Into the Light',
    overallScore: 274,
    judgeScores: [
      { category: 'Technique', score: 92, maxScore: 100, feedback: 'Strong foundation with clean lines and precise movements. Extension through the fingertips adds a polished quality. Minor ankle alignment corrections would elevate the score further.' },
      { category: 'Performance', score: 91, maxScore: 100, feedback: 'Engaging stage presence that draws the audience in. Facial expressions match the emotional arc of the piece. Could push dynamic contrast a bit more in the bridge section.' },
      { category: 'Choreography', score: 91, maxScore: 100, feedback: 'Well-structured routine with creative transitions and good use of levels. The opening sequence is particularly memorable. Consider adding more floor work to the second half for variety.' },
    ],
    timelineNotes: [
      { timestamp: 5, note: 'Strong opening — clean formation with excellent musicality on the intro hits.', type: 'strength' },
      { timestamp: 30, note: 'Turns sequence could use tighter spotting — slight wobble on the double pirouette.', type: 'technique' },
      { timestamp: 55, note: 'Beautiful lyrical section — emotion really shines through in the contemporary passage.', type: 'performance' },
      { timestamp: 80, note: 'Energy dipped slightly mid-routine — consider adding a visual accent to maintain momentum.', type: 'improvement' },
      { timestamp: 110, note: 'Powerful ending formation — great use of levels and dramatic final pose.', type: 'strength' },
    ],
    improvementPriorities: [
      { rank: 1, item: 'Turn technique & spotting', trainingTip: 'Practice slow single turns focusing on fixed spot before building speed. Aim for 15 min/day drill.', impact: 'high' },
      { rank: 2, item: 'Mid-routine energy', trainingTip: 'Add a "breath moment" followed by an explosive accent to re-engage the audience at the 1:20 mark.', impact: 'medium' },
      { rank: 3, item: 'Ankle alignment in relevé', trainingTip: 'Strengthen with Thera-Band exercises and practice balancing on relevé for 30-second holds.', impact: 'low' },
    ],
  },
  'preview-2': {
    title: 'Unstoppable',
    overallScore: 282,
    judgeScores: [
      { category: 'Technique', score: 94, maxScore: 100, feedback: 'Exceptional isolations and hitting. Crisp movements with clear start and stop points. Power moves are well-controlled and land with confidence.' },
      { category: 'Performance', score: 95, maxScore: 100, feedback: 'Electric stage presence — commands attention from the first beat. Swagger is authentic and age-appropriate. Crowd engagement is natural and confident.' },
      { category: 'Choreography', score: 93, maxScore: 100, feedback: 'Innovative musicality choices with unexpected accents that showcase personality. Great use of levels and dynamics. The breakdown section is a standout moment.' },
    ],
    timelineNotes: [
      { timestamp: 3, note: 'Explosive opening — immediate crowd engagement with high-energy isolations.', type: 'strength' },
      { timestamp: 25, note: 'Musicality on the syncopated section is outstanding — every accent is hit cleanly.', type: 'strength' },
      { timestamp: 45, note: 'Power move transition could be smoother — slight pause before the floor work.', type: 'technique' },
      { timestamp: 70, note: 'Breakdown section is the highlight — creative and unexpected choreographic choices.', type: 'performance' },
      { timestamp: 95, note: 'Ending is strong but could hit even harder — consider a more dramatic final freeze.', type: 'improvement' },
    ],
    improvementPriorities: [
      { rank: 1, item: 'Floor work transitions', trainingTip: 'Drill the drop-to-floor sequence at half speed to find a seamless entry. Focus on controlled descent.', impact: 'medium' },
      { rank: 2, item: 'Ending impact', trainingTip: 'Choreograph a 3-count freeze with full extension for maximum visual impact in the final pose.', impact: 'medium' },
    ],
  },
  'preview-3': {
    title: 'Gravity',
    overallScore: 268,
    judgeScores: [
      { category: 'Technique', score: 89, maxScore: 100, feedback: 'Beautiful fluidity with good use of suspension and release. Balances are generally strong. Flexibility is evident in extensions. Some moments where core engagement could be tighter.' },
      { category: 'Performance', score: 90, maxScore: 100, feedback: 'Genuinely emotional performance — the vulnerability reads well. Connection to the music is heartfelt. A few moments of self-consciousness break the spell.' },
      { category: 'Choreography', score: 89, maxScore: 100, feedback: 'Thoughtful movement choices that serve the story. The recurring motif works well thematically. Spatial patterns could be more varied to use the full stage.' },
    ],
    timelineNotes: [
      { timestamp: 8, note: 'Gorgeous opening — the slow unfold into the first movement phrase sets a powerful tone.', type: 'strength' },
      { timestamp: 35, note: 'Core engagement drops during the back attitude — focus on pulling up through the center.', type: 'technique' },
      { timestamp: 60, note: 'The emotional climax at the 1-minute mark is beautifully performed — real vulnerability.', type: 'performance' },
      { timestamp: 85, note: 'Stage coverage is limited — most movement happens center-stage. Use the diagonals more.', type: 'improvement' },
      { timestamp: 105, note: 'Lovely ending that circles back to the opening motif — gives the piece a sense of completeness.', type: 'strength' },
    ],
    improvementPriorities: [
      { rank: 1, item: 'Core stability in balances', trainingTip: 'Add 10 minutes of Pilates-based core work before each rehearsal. Focus on transverse abdominis engagement.', impact: 'high' },
      { rank: 2, item: 'Stage coverage', trainingTip: 'Map out a floor pattern that hits all four corners and both diagonals. Rehearse the new spacing 3x.', impact: 'medium' },
      { rank: 3, item: 'Performance confidence', trainingTip: 'Rehearse in front of a mirror less — practice performing for a friend or recording yourself to build comfort.', impact: 'medium' },
    ],
  },
};

export default function AnalysisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { previewMode } = useAuth();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [framesDeleted, setFramesDeleted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (previewMode && id in MOCK_ANALYSES) {
      setData(MOCK_ANALYSES[id]);
      setFramesDeleted(true);
      setLoading(false);
      return;
    }
    loadAnalysis();
  }, [id, previewMode]);

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
