import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getAuthToken } from './api';

// Product IDs — must match App Store Connect
export const IAP_PRODUCTS = {
  SINGLE: 'routinex_single',     // $8.99 — 2 analyses (BOGO launch)
  PACK: 'routinex_pack',         // $29.99 — 5 analyses
  MONTHLY: 'routinex_monthly',   // $12.99/mo — 10 analyses (auto-renewable subscription)
} as const;

// One-time consumables
const CONSUMABLE_IDS = [IAP_PRODUCTS.SINGLE, IAP_PRODUCTS.PACK];
// Auto-renewable subscriptions
const SUBSCRIPTION_IDS = [IAP_PRODUCTS.MONTHLY];
// All product IDs
const PRODUCT_IDS = [...CONSUMABLE_IDS, ...SUBSCRIPTION_IDS];
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'https://routinex.org';

// Detect Expo Go — NitroModules (used by react-native-iap) crash in Expo Go
// so we must NEVER require the module in that environment
const isExpoGo = Constants.appOwnership === 'expo';

let RNIap: any = null;

function getIAP() {
  // Short-circuit: never load native IAP module in Expo Go or non-iOS
  if (isExpoGo || Platform.OS !== 'ios') return null;
  if (!RNIap) {
    RNIap = require('react-native-iap');
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
          // Subscriptions are non-consumable; one-time packs/single are consumable
          const isSubscription = (SUBSCRIPTION_IDS as string[]).includes(purchase.productId);
          await iap.finishTransaction({ purchase, isConsumable: !isSubscription });
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
 * Load available IAP products from the App Store (consumables + subscriptions).
 */
export async function loadProducts() {
  const iap = getIAP();
  if (!iap || Platform.OS !== 'ios') return { products: [], subscriptions: [] };

  try {
    const products = await iap.getProducts({ skus: CONSUMABLE_IDS });
    let subscriptions: any[] = [];
    try {
      subscriptions = await iap.getSubscriptions({ skus: SUBSCRIPTION_IDS });
    } catch (err) {
      console.warn('Failed to load IAP subscriptions:', err);
    }
    return { products, subscriptions };
  } catch (err) {
    console.error('Failed to load IAP products:', err);
    return { products: [], subscriptions: [] };
  }
}

/**
 * Request purchase of the BOGO single offer ($8.99 = 2 analyses).
 */
export async function purchaseSingle(): Promise<void> {
  const iap = getIAP();
  if (!iap) throw new Error('In-App Purchases not available. Please use a native build.');
  await iap.requestPurchase({ sku: IAP_PRODUCTS.SINGLE });
}

/**
 * Request purchase of the competition pack ($29.99 = 5 analyses).
 */
export async function purchasePack(): Promise<void> {
  const iap = getIAP();
  if (!iap) throw new Error('In-App Purchases not available. Please use a native build.');
  await iap.requestPurchase({ sku: IAP_PRODUCTS.PACK });
}

/**
 * Request subscription to Pro Monthly ($12.99/mo = 10 analyses/month).
 * Auto-renewable subscription — Apple handles renewal and cancellation.
 */
export async function purchaseMonthly(): Promise<void> {
  const iap = getIAP();
  if (!iap) throw new Error('In-App Purchases not available. Please use a native build.');
  await iap.requestSubscription({ sku: IAP_PRODUCTS.MONTHLY });
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
