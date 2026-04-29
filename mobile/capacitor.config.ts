import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.routinex.app',
  appName: 'RoutineX',
  webDir: 'www',

  server: {
    url: 'https://routinex.org',
    cleartext: false,
  },

  ios: {
    scheme: 'RoutineX',
    backgroundColor: '#0a0a0a',
    contentInset: 'always',
    preferredContentMode: 'mobile',
    allowsLinkPreview: false,
    // Identifies this WebView as the native iOS shell so the web layer
    // can suppress marketing chrome (CountdownBanner, marketing nav,
    // "coming soon" cues) and render an app-only experience.
    appendUserAgent: 'RoutineXiOS/1.0',
  },

  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Camera: {
      quality: 90,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0a0a0a',
    },
    // Sunset-X splash on pure black. Holds ~1.4s while the WebView
    // boots, then fades 350ms straight into the app — no white flash,
    // no Capacitor-default blue-X intermediate frame.
    SplashScreen: {
      launchShowDuration: 1400,
      launchAutoHide: true,
      launchFadeOutDuration: 350,
      backgroundColor: '#000000',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
