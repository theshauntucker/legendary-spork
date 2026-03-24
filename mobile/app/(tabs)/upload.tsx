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
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as WebBrowser from 'expo-web-browser';
import { uploadFrames, getAuthToken } from '../../lib/api';
import { colors, gradients, gradientProps } from '../../lib/theme';

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
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        // On iOS 14+, check if user granted limited access
        if (Platform.OS === 'ios' && permission.accessPrivileges === 'limited') {
          Alert.alert(
            'Full Access Needed',
            'RoutineX needs full photo library access to select videos. Please go to Settings > RoutineX > Photos and select "Full Access".',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            'Permission Needed',
            'Please allow access to your photo library to select a video.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
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
    } catch (err: any) {
      console.error('Video pick error:', err);
      // Handle PHPhotosErrorDomain and other iOS errors
      if (err?.message?.includes('PHPhotos') || err?.message?.includes('couldn\'t be completed')) {
        Alert.alert(
          'Video Access Error',
          'There was a problem accessing your photo library. Please check that RoutineX has full photo access in Settings > RoutineX > Photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        setError('Could not select video. Please try again.');
      }
    }
  };

  const recordVideo = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Needed',
          'Please allow camera access to record a video.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
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
    } catch (err: any) {
      console.error('Video record error:', err);
      setError('Could not access camera. Please try again.');
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
      <View style={{ flex: 1, backgroundColor: colors.surface[950], justifyContent: 'center', padding: 24 }}>
        {/* Decorative blur */}
        <View style={{ position: 'absolute', top: '20%', right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(147,51,234,0.08)' }} />

        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
          Analyze a Routine
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
          Select or record a video to get AI-powered scoring and feedback.
        </Text>

        <TouchableOpacity
          onPress={pickVideo}
          activeOpacity={0.7}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 12,
          }}
        >
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>📁</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Choose from Library</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
              MP4, MOV — up to 5 minutes
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={recordVideo}
          activeOpacity={0.7}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🎥</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Record Now</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
              Use your camera to record a routine
            </Text>
          </View>
        </TouchableOpacity>

        {extracting && (
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={{ color: colors.primary[500], marginTop: 8, fontSize: 14 }}>
              Extracting frames...
            </Text>
          </View>
        )}

        {error ? (
          <Text style={{ color: colors.error, fontSize: 13, textAlign: 'center', marginTop: 16 }}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  }

  // Step: Review Frames
  if (step === 'frames') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface[950], padding: 24 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 }}>
          Extracted Frames
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 16 }}>
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
          <Text style={{ color: colors.successLight, fontSize: 13, lineHeight: 18 }}>
            🔒 Only these thumbnail images leave your device. Your full video is never uploaded.
            Thumbnails auto-delete within 24 hours.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => { setStep('select'); setFrames([]); setVideoUri(null); }}
            style={{
              flex: 1,
              backgroundColor: colors.cardBg,
              borderRadius: 999,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#d4d4d8', fontWeight: '600' }}>Re-pick</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setStep('metadata')}
            activeOpacity={0.8}
            style={{ flex: 1, borderRadius: 999, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={gradients.brand}
              {...gradientProps.diagonal}
              style={{ padding: 14, alignItems: 'center', borderRadius: 999 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step: Metadata + Confirm
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface[950] }}
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
            placeholderTextColor={colors.placeholder}
            style={inputStyle}
          />
        </View>

        <View>
          <Text style={labelStyle}>Dancer / Team Name</Text>
          <TextInput
            value={dancerName}
            onChangeText={setDancerName}
            placeholder="Emma R."
            placeholderTextColor={colors.placeholder}
            style={inputStyle}
          />
        </View>

        <View>
          <Text style={labelStyle}>Studio Name</Text>
          <TextInput
            value={studioName}
            onChangeText={setStudioName}
            placeholder="Elite Dance Academy"
            placeholderTextColor={colors.placeholder}
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
                  backgroundColor: danceStyle === s ? colors.primary[700] : colors.cardBg,
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: danceStyle === s ? colors.primary[600] : colors.border,
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
                  backgroundColor: ageGroup === ag ? colors.primary[700] : colors.cardBg,
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: ageGroup === ag ? colors.primary[600] : colors.border,
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
                  backgroundColor: entryType === et ? colors.primary[700] : colors.cardBg,
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: entryType === et ? colors.primary[600] : colors.border,
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
        <Text style={{ color: colors.error, fontSize: 13, textAlign: 'center', marginTop: 16 }}>
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
                backgroundColor: purchaseType === 'trial' ? 'rgba(168,85,247,0.15)' : colors.cardBg,
                borderRadius: 12,
                padding: 14,
                borderWidth: 1.5,
                borderColor: purchaseType === 'trial' ? colors.primary[600] : colors.border,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                First Analysis — $4.99
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                One-time trial offer — 1 full AI analysis
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setPurchaseType('pack')}
            style={{
              backgroundColor: purchaseType === 'pack' ? 'rgba(168,85,247,0.15)' : colors.cardBg,
              borderRadius: 12,
              padding: 14,
              borderWidth: 1.5,
              borderColor: purchaseType === 'pack' ? colors.primary[600] : colors.border,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              Competition Pack — $24.99
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
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
          <Text style={{ color: colors.successLight, fontSize: 13 }}>
            You have {creditsRemaining} analysis credit{creditsRemaining !== 1 ? 's' : ''} remaining.
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 }}>
        <TouchableOpacity
          onPress={() => setStep('frames')}
          style={{
            flex: 1,
            backgroundColor: colors.cardBg,
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
          activeOpacity={0.8}
          style={{
            flex: 2,
            borderRadius: 999,
            overflow: 'hidden',
            opacity: uploading || checkingCredits ? 0.6 : 1,
          }}
        >
          <LinearGradient
            colors={gradients.brand}
            {...gradientProps.diagonal}
            style={{ padding: 16, alignItems: 'center', borderRadius: 999 }}
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
          </LinearGradient>
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
  backgroundColor: 'rgba(255,255,255,0.07)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: 14,
  color: '#fff',
  fontSize: 15,
};
