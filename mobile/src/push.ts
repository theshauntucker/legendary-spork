/**
 * Push notification bridge for RoutineX iOS.
 * Registers device token with /api/push/register on app launch.
 * Server sends push when analysis completes.
 */

import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export async function initPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token) => {
    await registerDeviceToken(token.value);
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration failed:', error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    if (notification.data?.type === 'analysis_complete' && notification.data?.videoId) {
      window.dispatchEvent(
        new CustomEvent('routinex:analysis-complete', {
          detail: { videoId: notification.data.videoId },
        })
      );
    }
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const data = action.notification.data;
    if (data?.type === 'analysis_complete' && data?.videoId) {
      window.location.href = `/analysis/${data.videoId}`;
    }
  });
}

async function registerDeviceToken(token: string): Promise<void> {
  try {
    const response = await fetch('https://routinex.org/api/push/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, platform: 'ios' }),
    });
    if (!response.ok) {
      console.error('Device token registration failed');
    }
  } catch (err) {
    console.error('Device token registration error:', err);
  }
}
