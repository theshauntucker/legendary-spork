import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Linking, Platform, LogBox } from 'react-native';
import { AuthProvider, useAuth } from '../lib/auth';

// Catch unhandled native promise rejections (e.g. PHPhotosErrorDomain)
const originalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();

if ((global as any).ErrorUtils) {
  (global as any).ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
    if (error?.message?.includes('PHPhotos') || error?.message?.includes('3164')) {
      Alert.alert(
        'Video Access Issue',
        'Could not access that video. It may be stored in iCloud and needs to download first. Please open it in the Photos app, wait for it to download, then try again.',
        [
          { text: 'OK' },
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings(),
          },
        ]
      );
      return;
    }
    originalHandler?.(error, isFatal);
  });
}

// Also handle unhandled promise rejections
if (Platform.OS !== 'web') {
  const rejectionTracking = require('promise/setimmediate/rejection-tracking');
  rejectionTracking.disable();
  rejectionTracking.enable({
    allRejections: true,
    onUnhandled: (_id: number, error: any) => {
      const msg = error?.message || String(error);
      if (msg.includes('PHPhotos') || msg.includes('3164') || msg.includes("couldn't be completed")) {
        Alert.alert(
          'Video Access Issue',
          'Could not access that video. It may be stored in iCloud — open it in Photos first to download it, then try again here.',
          [{ text: 'OK' }]
        );
        return;
      }
      console.warn('Unhandled promise rejection:', error);
    },
    onHandled: () => {},
  });
}

// Suppress the noisy SecureStore warning
LogBox.ignoreLogs(['Value being stored in SecureStore is larger than 2048 bytes']);

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
