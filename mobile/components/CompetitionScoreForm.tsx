import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, gradientProps, glass, glassElevated } from '../lib/theme';
import { saveCompetitionScore, deleteCompetitionScore, CompetitionScoreData } from '../lib/api';

const awardOptions = ['Gold', 'High Gold', 'Platinum', 'Diamond'];

interface CompetitionScoreSectionProps {
  scores: CompetitionScoreData[];
  aiScore: number;
  analysisId: string;
  videoId: string;
  onScoresChange: (scores: CompetitionScoreData[]) => void;
}

export function CompetitionScoreSection({
  scores,
  aiScore,
  analysisId,
  videoId,
  onScoresChange,
}: CompetitionScoreSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Score', 'Remove this competition score?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCompetitionScore(id);
            onScoresChange(scores.filter((s) => s.id !== id));
          } catch {
            Alert.alert('Error', 'Failed to delete score.');
          }
        },
      },
    ]);
  };

  return (
    <View style={{ margin: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.5 }}>
          Competition Results
        </Text>
        <TouchableOpacity onPress={() => setShowForm(true)}>
          <Text style={{ color: colors.primary[400], fontSize: 13, fontWeight: '600' }}>
            + Log Score
          </Text>
        </TouchableOpacity>
      </View>

      {scores.length === 0 ? (
        <TouchableOpacity onPress={() => setShowForm(true)}>
          <View style={{
            ...glass,
            borderStyle: 'dashed',
            padding: 24,
            alignItems: 'center',
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Log your real competition score to compare with AI
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        scores.map((score) => (
          <View key={score.id} style={{ ...glassElevated, padding: 18, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                  {score.competition_name}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {new Date(score.competition_date).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(score.id)}>
                <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Remove</Text>
              </TouchableOpacity>
            </View>

            {score.actual_score && (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1, alignItems: 'center', ...glass, padding: 12, borderRadius: 14 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, marginBottom: 4 }}>AI Score</Text>
                  <Text style={{ color: colors.primary[400], fontSize: 22, fontWeight: '800' }}>{aiScore}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', ...glass, padding: 12, borderRadius: 14 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, marginBottom: 4 }}>Actual</Text>
                  <Text style={{ color: colors.gold[400], fontSize: 22, fontWeight: '800' }}>{score.actual_score}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', ...glass, padding: 12, borderRadius: 14 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, marginBottom: 4 }}>Diff</Text>
                  <Text style={{
                    color: aiScore > score.actual_score ? colors.success : aiScore < score.actual_score ? colors.gold[400] : colors.textSecondary,
                    fontSize: 22,
                    fontWeight: '800',
                  }}>
                    {aiScore - score.actual_score > 0 ? '+' : ''}{aiScore - score.actual_score}
                  </Text>
                </View>
              </View>
            )}

            {score.actual_award_level && (
              <Text style={{ color: colors.gold[300], fontSize: 12, marginTop: 8 }}>
                Award: {score.actual_award_level}
              </Text>
            )}
            {score.placement && (
              <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>
                Placement: {score.placement}
              </Text>
            )}
          </View>
        ))
      )}

      <CompetitionScoreFormModal
        visible={showForm}
        analysisId={analysisId}
        videoId={videoId}
        onSave={(newScore) => {
          onScoresChange([newScore, ...scores]);
          setShowForm(false);
        }}
        onClose={() => setShowForm(false)}
      />
    </View>
  );
}

function CompetitionScoreFormModal({
  visible,
  analysisId,
  videoId,
  onSave,
  onClose,
}: {
  visible: boolean;
  analysisId: string;
  videoId: string;
  onSave: (score: CompetitionScoreData) => void;
  onClose: () => void;
}) {
  const [competitionName, setCompetitionName] = useState('');
  const [competitionDate, setCompetitionDate] = useState('');
  const [actualScore, setActualScore] = useState('');
  const [actualAwardLevel, setActualAwardLevel] = useState('');
  const [placement, setPlacement] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!competitionName || !competitionDate) {
      Alert.alert('Required', 'Please enter competition name and date.');
      return;
    }

    setSaving(true);
    try {
      const result = await saveCompetitionScore({
        analysisId,
        videoId,
        competitionName,
        competitionDate,
        actualScore: actualScore ? parseFloat(actualScore) : undefined,
        actualAwardLevel: actualAwardLevel || undefined,
        placement: placement || undefined,
        notes: notes || undefined,
      });
      onSave(result);
      // Reset form
      setCompetitionName('');
      setCompetitionDate('');
      setActualScore('');
      setActualAwardLevel('');
      setPlacement('');
      setNotes('');
    } catch {
      Alert.alert('Error', 'Failed to save competition score.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 14,
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: colors.surface[900],
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          maxHeight: '85%',
        }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>
                Log Competition Score
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: colors.textSecondary, fontSize: 15 }}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6, fontWeight: '500' }}>
              Competition Name *
            </Text>
            <TextInput
              style={inputStyle}
              value={competitionName}
              onChangeText={setCompetitionName}
              placeholder="e.g. Star Power Orlando"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6, fontWeight: '500' }}>
              Competition Date * (YYYY-MM-DD)
            </Text>
            <TextInput
              style={inputStyle}
              value={competitionDate}
              onChangeText={setCompetitionDate}
              placeholder="e.g. 2026-03-15"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6, fontWeight: '500' }}>
              Actual Score (0-300)
            </Text>
            <TextInput
              style={inputStyle}
              value={actualScore}
              onChangeText={setActualScore}
              placeholder="e.g. 278"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
            />

            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8, fontWeight: '500' }}>
              Award Level Received
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {awardOptions.map((award) => (
                <TouchableOpacity
                  key={award}
                  onPress={() => setActualAwardLevel(actualAwardLevel === award ? '' : award)}
                >
                  {actualAwardLevel === award ? (
                    <LinearGradient
                      colors={gradients.brand}
                      {...gradientProps.diagonal}
                      style={{ borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 }}
                    >
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{award}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={{
                      borderRadius: 999,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>{award}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6, fontWeight: '500' }}>
              Placement (optional)
            </Text>
            <TextInput
              style={inputStyle}
              value={placement}
              onChangeText={setPlacement}
              placeholder="e.g. 1st Overall"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6, fontWeight: '500' }}>
              Notes (optional)
            </Text>
            <TextInput
              style={{ ...inputStyle, height: 80, textAlignVertical: 'top' }}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any notes..."
              placeholderTextColor={colors.placeholder}
              multiline
            />

            <TouchableOpacity onPress={handleSubmit} disabled={saving} style={{ borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
              <LinearGradient
                colors={gradients.brand}
                {...gradientProps.diagonal}
                style={{
                  borderRadius: 999,
                  paddingVertical: 18,
                  alignItems: 'center',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Save Score</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
