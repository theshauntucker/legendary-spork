import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Linking, Platform, LogBox } from 'react-native';
import { AuthProvider, useAuth } from '../lib/auth';
import { initIAP, setupPurchaseListeners, cleanupIAP } from '../lib/iap';

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

  // Initialize Apple In-App Purchases (iOS only)
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    initIAP();

    const cleanup = setupPurchaseListeners(
      () => {
        // Credits granted successfully — show confirmation
        Alert.alert(
          'Purchase Complete',
          'Your credits have been added. You can now analyze a routine!',
          [{ text: 'OK' }]
        );
      },
      (message: string) => {
        // Purchase error
        if (message !== 'Purchase cancelled.') {
          Alert.alert('Purchase Issue', message, [{ text: 'OK' }]);
        }
      },
    );

    return () => {
      cleanup();
      cleanupIAP();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isLanding = segments[0] === 'landing';
    // Legal/info pages are accessible to everyone
    const isPublicPage = ['privacy', 'terms', 'about', 'faq'].includes(segments[0] as string);

    if (!user && !inAuthGroup && !isLanding && !isPublicPage) {
      router.replace('/landing');
    } else if (user && (inAuthGroup || isLanding)) {
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
