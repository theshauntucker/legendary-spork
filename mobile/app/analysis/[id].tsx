// Analysis report view — will port AnalysisReport from web
// Includes: judge scores, timeline, improvement priorities, privacy controls
// Placeholder for full implementation
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function AnalysisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Analysis Report</Text>
      <Text style={{ color: '#9ca3af', marginTop: 8 }}>Video ID: {id}</Text>
      <Text style={{ color: '#9ca3af', marginTop: 4 }}>Full report — implementation pending</Text>
    </View>
  );
}
