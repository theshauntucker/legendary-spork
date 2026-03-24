import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ONBOARDED: 'routinex_onboarded',
  PUSH_TOKEN: 'routinex_push_token',
} as const;

export async function hasOnboarded(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(KEYS.ONBOARDED);
  return value === 'true';
}

export async function setOnboarded(): Promise<void> {
  await SecureStore.setItemAsync(KEYS.ONBOARDED, 'true');
}

export async function getPushToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.PUSH_TOKEN);
}

export async function setPushToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.PUSH_TOKEN, token);
}
