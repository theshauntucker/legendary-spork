import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as WebBrowser from 'expo-web-browser';
import { uploadFrames, getAuthToken } from '../../lib/api';

const DANCE_STYLES = [
  'Contemporary', 'Jazz', 'Lyrical', 'Hip Hop', 'Tap',
  'Ballet', 'Acro', 'Musical Theater', 'Pom', 'Kick', 'Cheer',
];
const AGE_GROUPS = ['Mini (5-8)', 'Junior (9-11)', 'Teen (12-14)', 'Senior (15-18)', 'Adult (19+)'];
const ENTRY_TYPES = ['Solo', 'Duo/Trio', 'Small Group', 'Large Group', 'Production'];

// Frame extraction timestamps (seconds into the video)
const FRAME_TIMESTAMPS = [1, 5, 10, 15, 20, 30, 45, 60, 75, 90, 105, 120];

type Step = 'select' | 'frames' | 'metadata' | 'confirm';

export default function UploadScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [frames, setFrames] = useState<{ uri: string; timestamp: number }[]>([]);
  const [extracting, setExtracting] = useState(false);

  // Metadata
  const [routineTitle, setRoutineTitle] = useState('');
  const [dancerName, setDancerName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [danceStyle, setDanceStyle] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [entryType, setEntryType] = useState('');

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library to select a video.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
      videoMaxDuration: 300, // 5 minutes
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
      await extractFrames(result.assets[0].uri);
    }
  };

  const recordVideo = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to record a video.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      quality: 1,
      videoMaxDuration: 300,
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
      await extractFrames(result.assets[0].uri);
    }
  };

  const extractFrames = async (uri: string) => {
    setExtracting(true);
    setError('');
    const extracted: { uri: string; timestamp: number }[] = [];

    for (const time of FRAME_TIMESTAMPS) {
      try {
        const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(uri, {
          time: time * 1000,
          quality: 0.8,
        });
        extracted.push({ uri: thumbUri, timestamp: time });
      } catch {
        // Video might be shorter — stop extracting
        break;
      }
    }

    if (extracted.length < 3) {
      setError('Could not extract enough frames. Please try a different video.');
      setExtracting(false);
      return;
    }

    setFrames(extracted);
    setExtracting(false);
    setStep('frames');
  };

  const [purchaseType, setPurchaseType] = useState<'trial' | 'pack'>('trial');
  const [hasCredits, setHasCredits] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState(0);
  const [trialUsed, setTrialUsed] = useState(false);
  const [checkingCredits, setCheckingCredits] = useState(true);

  // Check credits on mount
  React.useEffect(() => {
    const checkCredits = async () => {
      try {
        const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'https://routinex.org';
        const token = await getAuthToken();
        const res = await fetch(`${API_BASE}/api/credits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setHasCredits(data.remaining > 0);
          setCreditsRemaining(data.remaining);
          setTrialUsed(data.trialUsed || false);
        }
      } catch {}
      setCheckingCredits(false);
    };
    checkCredits();
  }, []);

  const handleSubmit = async () => {
    if (!routineTitle || !danceStyle || !entryType) {
      setError('Please fill in routine name, style, and entry type.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'https://routinex.org';
      const token = await getAuthToken();

      // If user has no credits, go through Stripe checkout first
      if (!hasCredits) {
        const checkoutRes = await fetch(`${API_BASE}/api/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: purchaseType }),
        });
        const checkoutData = await checkoutRes.json();

        if (checkoutData.error === 'trial_used') {
          setTrialUsed(true);
          setPurchaseType('pack');
          setError(checkoutData.message);
          setUploading(false);
          return;
        }

        if (checkoutData.url) {
          const result = await WebBrowser.openBrowserAsync(checkoutData.url);
          if (result.type === 'cancel') {
            setError('Payment was cancelled. Please try again.');
            setUploading(false);
            return;
          }
        } else {
          setError('Could not start checkout. Please try again.');
          setUploading(false);
          return;
        }
      }

      // Upload frames and start analysis
      const { videoId } = await uploadFrames(frames, {
        routineTitle,
        dancerName: dancerName || 'Unknown',
        studioName: studioName || 'Independent',
        danceStyle,
        ageGroup: ageGroup || 'Not specified',
        entryType,
        competitionType: '',
        level: '',
      });

      router.push(`/processing/${videoId}`);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Step: Select Video
  if (step === 'select') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
          Analyze a Routine
        </Text>
        <Text style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
          Select or record a video to get AI-powered scoring and feedback.
        </Text>

        <TouchableOpacity
          onPress={pickVideo}
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 36, marginBottom: 8 }}>📁</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Choose from Library</Text>
          <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>
            MP4, MOV — up to 5 minutes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={recordVideo}
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🎥</Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Record Now</Text>
          <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>
            Use your camera to record a routine
          </Text>
        </TouchableOpacity>

        {extracting && (
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <ActivityIndicator size="large" color="#a855f7" />
            <Text style={{ color: '#a855f7', marginTop: 8, fontSize: 14 }}>
              Extracting frames...
            </Text>
          </View>
        )}

        {error ? (
          <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 16 }}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  }

  // Step: Review Frames
  if (step === 'frames') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', padding: 24 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 }}>
          Extracted Frames
        </Text>
        <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>
          {frames.length} frames extracted. These will be sent for AI analysis.
          Your full video stays on your device.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 24 }}
        >
          {frames.map((frame, i) => (
            <Image
              key={i}
              source={{ uri: frame.uri }}
              style={{
                width: 140,
                height: 80,
                borderRadius: 8,
                marginRight: 8,
                backgroundColor: '#1f2937',
              }}
            />
          ))}
        </ScrollView>

        <View style={{
          backgroundColor: 'rgba(16,185,129,0.1)',
          borderRadius: 12,
          padding: 12,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: 'rgba(16,185,129,0.2)',
        }}>
          <Text style={{ color: '#6ee7b7', fontSize: 13, lineHeight: 18 }}>
            🔒 Only these thumbnail images leave your device. Your full video is never uploaded.
            Thumbnails auto-delete within 24 hours.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => { setStep('select'); setFrames([]); setVideoUri(null); }}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 999,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#d4d4d8', fontWeight: '600' }}>Re-pick</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setStep('metadata')}
            style={{
              flex: 1,
              backgroundColor: '#9333ea',
              borderRadius: 999,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step: Metadata + Confirm
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
      contentContainerStyle={{ padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
        Routine Details
      </Text>

      <View style={{ gap: 14 }}>
        <View>
          <Text style={labelStyle}>Routine Name *</Text>
          <TextInput
            value={routineTitle}
            onChangeText={setRoutineTitle}
            placeholder='"Into the Light"'
            placeholderTextColor="#52525b"
            style={inputStyle}
          />
        </View>

        <View>
          <Text style={labelStyle}>Dancer / Team Name</Text>
          <TextInput
            value={dancerName}
            onChangeText={setDancerName}
            placeholder="Emma R."
            placeholderTextColor="#52525b"
            style={inputStyle}
          />
        </View>

        <View>
          <Text style={labelStyle}>Studio Name</Text>
          <TextInput
            value={studioName}
            onChangeText={setStudioName}
            placeholder="Elite Dance Academy"
            placeholderTextColor="#52525b"
            style={inputStyle}
          />
        </View>

        {/* Style Picker */}
        <View>
          <Text style={labelStyle}>Dance Style *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DANCE_STYLES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setDanceStyle(s)}
                style={{
                  backgroundColor: danceStyle === s ? '#7c3aed' : 'rgba(255,255,255,0.05)',
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: danceStyle === s ? '#9333ea' : 'rgba(255,255,255,0.1)',
                }}
              >
                <Text style={{ color: danceStyle === s ? '#fff' : '#d4d4d8', fontSize: 13 }}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Age Group */}
        <View>
          <Text style={labelStyle}>Age Group</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {AGE_GROUPS.map((ag) => (
              <TouchableOpacity
                key={ag}
                onPress={() => setAgeGroup(ag)}
                style={{
                  backgroundColor: ageGroup === ag ? '#7c3aed' : 'rgba(255,255,255,0.05)',
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: ageGroup === ag ? '#9333ea' : 'rgba(255,255,255,0.1)',
                }}
              >
                <Text style={{ color: ageGroup === ag ? '#fff' : '#d4d4d8', fontSize: 13 }}>
                  {ag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Entry Type */}
        <View>
          <Text style={labelStyle}>Entry Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ENTRY_TYPES.map((et) => (
              <TouchableOpacity
                key={et}
                onPress={() => setEntryType(et)}
                style={{
                  backgroundColor: entryType === et ? '#7c3aed' : 'rgba(255,255,255,0.05)',
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: entryType === et ? '#9333ea' : 'rgba(255,255,255,0.1)',
                }}
              >
                <Text style={{ color: entryType === et ? '#fff' : '#d4d4d8', fontSize: 13 }}>
                  {et}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {error ? (
        <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 16 }}>
          {error}
        </Text>
      ) : null}

      {/* Pricing selection — only shown when user has no credits */}
      {!hasCredits && !checkingCredits && (
        <View style={{ marginTop: 20, gap: 10 }}>
          <Text style={{ color: '#d4d4d8', fontSize: 13, fontWeight: '500', marginBottom: 4 }}>
            Choose a plan to continue:
          </Text>

          {!trialUsed && (
            <TouchableOpacity
              onPress={() => setPurchaseType('trial')}
              style={{
                backgroundColor: purchaseType === 'trial' ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                padding: 14,
                borderWidth: 1.5,
                borderColor: purchaseType === 'trial' ? '#9333ea' : 'rgba(255,255,255,0.1)',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                First Analysis — $4.99
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
                One-time trial offer — 1 full AI analysis
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setPurchaseType('pack')}
            style={{
              backgroundColor: purchaseType === 'pack' ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: 14,
              borderWidth: 1.5,
              borderColor: purchaseType === 'pack' ? '#9333ea' : 'rgba(255,255,255,0.1)',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              Competition Pack — $24.99
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
              5 analyses — only $5 each. Best value.
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {hasCredits && !checkingCredits && (
        <View style={{
          backgroundColor: 'rgba(16,185,129,0.1)',
          borderRadius: 12,
          padding: 12,
          marginTop: 20,
          borderWidth: 1,
          borderColor: 'rgba(16,185,129,0.2)',
        }}>
          <Text style={{ color: '#6ee7b7', fontSize: 13 }}>
            You have {creditsRemaining} analysis credit{creditsRemaining !== 1 ? 's' : ''} remaining.
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 }}>
        <TouchableOpacity
          onPress={() => setStep('frames')}
          style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 999,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#d4d4d8', fontWeight: '600' }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={uploading || checkingCredits}
          style={{
            flex: 2,
            backgroundColor: '#9333ea',
            borderRadius: 999,
            padding: 16,
            alignItems: 'center',
            opacity: uploading || checkingCredits ? 0.6 : 1,
          }}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {hasCredits
                ? 'Analyze Now'
                : purchaseType === 'trial'
                  ? 'Analyze — $4.99'
                  : 'Analyze — $24.99'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const labelStyle = {
  color: '#d4d4d8',
  fontSize: 13,
  marginBottom: 6,
  fontWeight: '500' as const,
};

const inputStyle = {
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: 14,
  color: '#fff',
  fontSize: 15,
};
