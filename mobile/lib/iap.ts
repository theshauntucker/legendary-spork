import { Platform } from 'react-native';
import { getAuthToken } from './api';

// Product IDs — must match App Store Connect
export const IAP_PRODUCTS = {
  SINGLE: 'routinex_single',   // $8.99 — 1 analysis credit
  PACK: 'routinex_pack',       // $29.99 — 5 analysis credits
} as const;

const PRODUCT_IDS = [IAP_PRODUCTS.SINGLE, IAP_PRODUCTS.PACK];
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'https://routinex.org';

// Lazy-load react-native-iap to avoid crashing in Expo Go
// (NitroModules are only available in EAS/native builds)
let RNIap: any = null;

function getIAP() {
  if (!RNIap) {
    try {
      RNIap = require('react-native-iap');
    } catch {
      console.warn('react-native-iap not available (Expo Go). Purchases disabled.');
    }
  }
  return RNIap;
}

// Store listeners for cleanup
let purchaseUpdateSubscription: any = null;
let purchaseErrorSubscription: any = null;

// Callbacks
let onCreditsGranted: (() => void) | null = null;
let onPurchaseError: ((message: string) => void) | null = null;

/**
 * Check if IAP is available (native build, not Expo Go)
 */
export function isIAPAvailable(): boolean {
  if (Platform.OS !== 'ios') return false;
  return !!getIAP();
}

/**
 * Initialize IAP connection.
 * Call once on app start (in _layout.tsx).
 */
export async function initIAP(): Promise<void> {
  if (Platform.OS !== 'ios') return;

  const iap = getIAP();
  if (!iap) return;

  try {
    await iap.initConnection();
  } catch (err) {
    console.warn('IAP init failed:', err);
  }
}

/**
 * Set up purchase listeners. Call once on app start.
 * Returns a cleanup function to call on unmount.
 */
export function setupPurchaseListeners(
  onSuccess: () => void,
  onError: (message: string) => void,
): () => void {
  const iap = getIAP();
  if (!iap) return () => {};

  onCreditsGranted = onSuccess;
  onPurchaseError = onError;

  // Listen for successful purchases
  purchaseUpdateSubscription = iap.purchaseUpdatedListener(
    async (purchase: any) => {
      try {
        const receipt = purchase.transactionReceipt;
        if (!receipt) {
          console.error('No transaction receipt');
          return;
        }

        const token = await getAuthToken();
        const res = await fetch(`${API_BASE}/api/iap/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            receipt,
            productId: purchase.productId,
            transactionId: purchase.transactionId,
            platform: Platform.OS,
          }),
        });

        const data = await res.json();

        if (res.ok && data.verified) {
          await iap.finishTransaction({ purchase, isConsumable: true });
          onCreditsGranted?.();
        } else {
          console.error('Receipt verification failed:', data.error);
          onPurchaseError?.(data.error || 'Payment verification failed. Please try again.');
        }
      } catch (err) {
        console.error('Purchase processing error:', err);
        onPurchaseError?.('Payment processing failed. Your purchase will be retried.');
      }
    },
  );

  // Listen for purchase errors
  purchaseErrorSubscription = iap.purchaseErrorListener(
    (error: any) => {
      if (error.code === 'E_USER_CANCELLED') {
        onPurchaseError?.('Purchase cancelled.');
      } else {
        console.error('Purchase error:', error);
        onPurchaseError?.('Purchase failed. Please try again.');
      }
    },
  );

  return () => {
    purchaseUpdateSubscription?.remove();
    purchaseErrorSubscription?.remove();
    purchaseUpdateSubscription = null;
    purchaseErrorSubscription = null;
    onCreditsGranted = null;
    onPurchaseError = null;
  };
}

/**
 * Load available IAP products from the App Store.
 */
export async function loadProducts() {
  const iap = getIAP();
  if (!iap || Platform.OS !== 'ios') return [];

  try {
    return await iap.getProducts({ skus: PRODUCT_IDS });
  } catch (err) {
    console.error('Failed to load IAP products:', err);
    return [];
  }
}

/**
 * Request purchase of a single analysis ($8.99).
 */
export async function purchaseSingle(): Promise<void> {
  const iap = getIAP();
  if (!iap) throw new Error('In-App Purchases not available. Please use a native build.');
  await iap.requestPurchase({ sku: IAP_PRODUCTS.SINGLE });
}

/**
 * Request purchase of the competition pack ($29.99).
 */
export async function purchasePack(): Promise<void> {
  const iap = getIAP();
  if (!iap) throw new Error('In-App Purchases not available. Please use a native build.');
  await iap.requestPurchase({ sku: IAP_PRODUCTS.PACK });
}

/**
 * Clean up IAP connection.
 */
export async function cleanupIAP(): Promise<void> {
  const iap = getIAP();
  if (!iap || Platform.OS !== 'ios') return;

  try {
    await iap.endConnection();
  } catch {
    // Ignore cleanup errors
  }
}
