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
import { colors, gradients, gradientProps, glass, glassElevated, inputStyle, labelStyle, screenGradient } from '../../lib/theme';

const DANCE_STYLES = [
  'Contemporary', 'Jazz', 'Lyrical', 'Hip Hop', 'Tap',
  'Ballet', 'Acro', 'Musical Theater', 'Pom', 'Kick', 'Cheer',
];
const AGE_GROUPS = ['Mini (5-8)', 'Junior (9-11)', 'Teen (12-14)', 'Senior (15-18)', 'Adult (19+)'];
const ENTRY_TYPES = ['Solo', 'Duo/Trio', 'Small Group', 'Large Group', 'Production'];

const FRAME_TIMESTAMPS = [1, 5, 10, 15, 20, 30, 45, 60, 75, 90, 105, 120];

type Step = 'select' | 'frames' | 'metadata' | 'confirm';

export default function UploadScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [frames, setFrames] = useState<{ uri: string; timestamp: number }[]>([]);
  const [extracting, setExtracting] = useState(false);

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
        videoMaxDuration: 300,
      });

      if (!result.canceled && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        await extractFrames(result.assets[0].uri);
      }
    } catch (err: any) {
      console.error('Video pick error:', err);
      if (err?.message?.includes('PHPhotos') || err?.message?.includes("couldn't be completed")) {
        Alert.alert(
          'Video Access Issue',
          'Could not access that video. It may be stored in iCloud — open it in the Photos app first to download it, then try again.',
          [
            { text: 'OK' },
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

  const [purchaseType, setPurchaseType] = useState<'single' | 'pack'>('single');
  const [hasCredits, setHasCredits] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState(0);
  const [checkingCredits, setCheckingCredits] = useState(true);

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

        if (checkoutData.error) {
          setError(checkoutData.message || checkoutData.error);
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
      <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1 }}>
        {/* Background blurs */}
        <View style={{ position: 'absolute', top: '15%', right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(147,51,234,0.22)' }} />
        <View style={{ position: 'absolute', bottom: '20%', left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(236,72,153,0.14)' }} />
        <View style={{ position: 'absolute', top: '50%', left: '30%', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(245,158,11,0.10)' }} />

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
            Analyze a <Text style={{ color: colors.primary[400] }}>Routine</Text>
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 36, lineHeight: 22 }}>
            Select or record a video to get{'\n'}AI-powered scoring and feedback.
          </Text>

          <TouchableOpacity onPress={pickVideo} activeOpacity={0.7} style={{ marginBottom: 14 }}>
            <View style={{ ...glassElevated, padding: 28, alignItems: 'center' }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: 'rgba(147,51,234,0.15)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 14,
              }}>
                <Text style={{ fontSize: 28 }}>📁</Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>Choose from Library</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>
                MP4, MOV — up to 5 minutes
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={recordVideo} activeOpacity={0.7}>
            <View style={{ ...glassElevated, padding: 28, alignItems: 'center' }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: 'rgba(236,72,153,0.12)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 14,
              }}>
                <Text style={{ fontSize: 28 }}>🎥</Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>Record Now</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>
                Use your camera to record a routine
              </Text>
            </View>
          </TouchableOpacity>

          {extracting && (
            <View style={{ alignItems: 'center', marginTop: 28 }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: 'rgba(147,51,234,0.15)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <ActivityIndicator size="large" color={colors.primary[400]} />
              </View>
              <Text style={{ color: colors.primary[400], marginTop: 12, fontSize: 14, fontWeight: '500' }}>
                Extracting frames...
              </Text>
            </View>
          )}

          {error ? (
            <View style={{
              backgroundColor: 'rgba(248,113,113,0.1)',
              borderRadius: 14,
              padding: 14,
              marginTop: 16,
              borderWidth: 1,
              borderColor: 'rgba(248,113,113,0.2)',
            }}>
              <Text style={{ color: colors.error, fontSize: 13, textAlign: 'center' }}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Privacy badge */}
          <View style={{
            ...glass,
            borderColor: 'rgba(245,158,11,0.2)',
            padding: 16,
            marginTop: 28,
            alignItems: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 4 }}>
              🔒 Your video never leaves your phone.
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12, textAlign: 'center', lineHeight: 17 }}>
              Only still-frame thumbnails are analyzed by AI.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // Step: Review Frames
  if (step === 'frames') {
    return (
      <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(147,51,234,0.18)' }} />

        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6, letterSpacing: -0.5 }}>
            Extracted Frames
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 20, lineHeight: 20 }}>
            {frames.length} frames extracted. These will be sent for AI analysis.
            Your full video stays on your device.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            {frames.map((frame, i) => (
              <View key={i} style={{ marginRight: 10, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Image
                  source={{ uri: frame.uri }}
                  style={{
                    width: 150,
                    height: 86,
                    backgroundColor: colors.surface[800],
                  }}
                />
              </View>
            ))}
          </ScrollView>

          <View style={{
            ...glass,
            borderColor: 'rgba(16,185,129,0.25)',
            backgroundColor: 'rgba(16,185,129,0.08)',
            padding: 16,
            marginBottom: 28,
          }}>
            <Text style={{ color: colors.successLight, fontSize: 13, lineHeight: 19 }}>
              🔒 Only these thumbnail images leave your device. Your full video is never uploaded. Thumbnails auto-delete within 24 hours.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => { setStep('select'); setFrames([]); setVideoUri(null); }}
              style={{
                flex: 1,
                ...glass,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#d4d4d8', fontWeight: '600' }}>Re-pick</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep('metadata')}
              activeOpacity={0.8}
              style={{ flex: 1, borderRadius: 20, overflow: 'hidden' }}
            >
              <LinearGradient
                colors={gradients.brand}
                {...gradientProps.diagonal}
                style={{ padding: 16, alignItems: 'center', borderRadius: 20 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // Step: Metadata + Confirm
  return (
    <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1 }}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ position: 'absolute', top: -40, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(147,51,234,0.18)' }} />

      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 20, letterSpacing: -0.5 }}>
        Routine Details
      </Text>

      <View style={{ gap: 18 }}>
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
                  backgroundColor: danceStyle === s ? 'rgba(147,51,234,0.30)' : 'rgba(255,255,255,0.06)',
                  borderRadius: 999,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: danceStyle === s ? colors.primary[600] : 'rgba(255,255,255,0.08)',
                }}
              >
                <Text style={{ color: danceStyle === s ? '#fff' : '#d4d4d8', fontSize: 13, fontWeight: danceStyle === s ? '600' : '400' }}>
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
                  backgroundColor: ageGroup === ag ? 'rgba(147,51,234,0.30)' : 'rgba(255,255,255,0.06)',
                  borderRadius: 999,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: ageGroup === ag ? colors.primary[600] : 'rgba(255,255,255,0.08)',
                }}
              >
                <Text style={{ color: ageGroup === ag ? '#fff' : '#d4d4d8', fontSize: 13, fontWeight: ageGroup === ag ? '600' : '400' }}>
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
                  backgroundColor: entryType === et ? 'rgba(147,51,234,0.30)' : 'rgba(255,255,255,0.06)',
                  borderRadius: 999,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: entryType === et ? colors.primary[600] : 'rgba(255,255,255,0.08)',
                }}
              >
                <Text style={{ color: entryType === et ? '#fff' : '#d4d4d8', fontSize: 13, fontWeight: entryType === et ? '600' : '400' }}>
                  {et}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {error ? (
        <View style={{
          backgroundColor: 'rgba(248,113,113,0.1)',
          borderRadius: 14,
          padding: 14,
          marginTop: 16,
          borderWidth: 1,
          borderColor: 'rgba(248,113,113,0.2)',
        }}>
          <Text style={{ color: colors.error, fontSize: 13, textAlign: 'center' }}>{error}</Text>
        </View>
      ) : null}

      {/* Pricing selection */}
      {!hasCredits && !checkingCredits && (
        <View style={{ marginTop: 24, gap: 12 }}>
          <Text style={{ color: '#d4d4d8', fontSize: 13, fontWeight: '600', marginBottom: 2 }}>
            Choose a plan to continue:
          </Text>

          <TouchableOpacity onPress={() => setPurchaseType('single')}>
            <View style={{
              ...glass,
              borderColor: purchaseType === 'single' ? colors.primary[500] : 'rgba(255,255,255,0.1)',
              borderWidth: purchaseType === 'single' ? 2 : 1,
              backgroundColor: purchaseType === 'single' ? 'rgba(147,51,234,0.20)' : 'rgba(255,255,255,0.06)',
              padding: 18,
            }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                Single Analysis — $8.99
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                1 full AI analysis for any routine
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPurchaseType('pack')}>
            <View style={{
              ...glass,
              borderColor: purchaseType === 'pack' ? colors.primary[500] : 'rgba(255,255,255,0.1)',
              borderWidth: purchaseType === 'pack' ? 2 : 1,
              backgroundColor: purchaseType === 'pack' ? 'rgba(147,51,234,0.20)' : 'rgba(255,255,255,0.06)',
              padding: 18,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                  Competition Pack — $29.99
                </Text>
                <View style={{ borderRadius: 999, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={gradients.brand}
                    {...gradientProps.leftToRight}
                    style={{ paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>BEST VALUE</Text>
                  </LinearGradient>
                </View>
              </View>
              <Text style={{ color: colors.primary[400], fontSize: 12, fontWeight: '600', marginTop: 4 }}>
                Only $6/analysis — save $15 vs buying singles
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                5 analyses — use on different routines or track progress
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {hasCredits && !checkingCredits && (
        <View style={{
          ...glass,
          borderColor: 'rgba(16,185,129,0.25)',
          backgroundColor: 'rgba(16,185,129,0.08)',
          padding: 16,
          marginTop: 24,
        }}>
          <Text style={{ color: colors.successLight, fontSize: 14, fontWeight: '600' }}>
            ✨ {creditsRemaining} analysis credit{creditsRemaining !== 1 ? 's' : ''} remaining
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 28, marginBottom: 40 }}>
        <TouchableOpacity
          onPress={() => setStep('frames')}
          style={{
            flex: 1,
            ...glass,
            padding: 18,
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
            borderRadius: 20,
            overflow: 'hidden',
            opacity: uploading || checkingCredits ? 0.6 : 1,
          }}
        >
          <LinearGradient
            colors={gradients.brand}
            {...gradientProps.diagonal}
            style={{ padding: 18, alignItems: 'center', borderRadius: 20 }}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                {hasCredits
                  ? 'Analyze Now'
                  : purchaseType === 'single'
                    ? 'Get 1 Analysis — $8.99'
                    : 'Get 5 Analyses — $29.99'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}
