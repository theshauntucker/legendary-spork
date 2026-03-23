// Processing status screen — shows animation while AI processes the video
// Polls the API for status updates
// Placeholder for full implementation
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ProcessingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
      <ActivityIndicator size="large" color="#10b981" />
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 16 }}>
        Analyzing Your Routine
      </Text>
      <Text style={{ color: '#9ca3af', marginTop: 8 }}>Video ID: {id}</Text>
      <Text style={{ color: '#9ca3af', marginTop: 4 }}>This usually takes 1-2 minutes...</Text>
    </View>
  );
}
