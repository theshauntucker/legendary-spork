/**
 * Main bridge — initializes all native capabilities when running inside Capacitor.
 * This script is injected into the WebView and exposes native APIs to the web app.
 *
 * The web app detects Capacitor via `window.Capacitor?.isNativePlatform()` and
 * calls these functions instead of web-only equivalents.
 */

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App } from '@capacitor/app';
import { initIAP, loadProducts, purchase, restorePurchases, PRODUCT_IDS } from './iap';
import { initPushNotifications } from './push';
import { pickVideoFromLibrary, captureVideo, checkPermissions, requestPermissions } from './camera';

declare global {
  interface Window {
    RoutineX: typeof RoutineXBridge;
  }
}

const RoutineXBridge = {
  isNative: () => Capacitor.isNativePlatform(),
  platform: () => Capacitor.getPlatform(),

  // IAP
  iap: {
    init: initIAP,
    loadProducts,
    purchase,
    restorePurchases,
    PRODUCT_IDS,
  },

  // Camera
  camera: {
    pickVideo: pickVideoFromLibrary,
    captureVideo,
    checkPermissions,
    requestPermissions,
  },

  // Haptics
  haptics: {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
      return Haptics.impact({ style: map[style] });
    },
    notification: (type: 'success' | 'warning' | 'error' = 'success') => {
      return Haptics.notification({ type: type as any });
    },
  },

  // Navigation (called from native tab bar or web)
  navigate: (path: string) => {
    window.location.href = path;
  },
};

async function init() {
  if (!Capacitor.isNativePlatform()) return;

  window.RoutineX = RoutineXBridge;

  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({ color: '#0a0a0a' });

  await initIAP().catch(console.error);
  await initPushNotifications().catch(console.error);

  App.addListener('backButton', () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  });

  // Hide web-rendered tab bar when native tabs are present
  document.documentElement.classList.add('capacitor-native');
}

init();
