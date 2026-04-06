import { Platform } from 'react-native';
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type ProductPurchase,
  type PurchaseError,
  type Subscription,
  flushFailedPurchasesCachedAsPendingAndroid,
} from 'react-native-iap';
import { getAuthToken } from './api';

// Product IDs — must match App Store Connect
export const IAP_PRODUCTS = {
  SINGLE: 'routinex_single',   // $8.99 — 1 analysis credit
  PACK: 'routinex_pack',       // $29.99 — 5 analysis credits
} as const;

const PRODUCT_IDS = [IAP_PRODUCTS.SINGLE, IAP_PRODUCTS.PACK];
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'https://routinex.org';

// Store listeners for cleanup
let purchaseUpdateSubscription: Subscription | null = null;
let purchaseErrorSubscription: Subscription | null = null;

// Callback for when credits are successfully granted
let onCreditsGranted: (() => void) | null = null;
// Callback for purchase errors
let onPurchaseError: ((message: string) => void) | null = null;

/**
 * Initialize IAP connection and load products.
 * Call once on app start (in _layout.tsx).
 */
export async function initIAP(): Promise<void> {
  if (Platform.OS !== 'ios') return; // Only iOS uses IAP

  try {
    await initConnection();

    // Clear any pending Android purchases (no-op on iOS, but safe to call)
    if (Platform.OS === 'android') {
      await flushFailedPurchasesCachedAsPendingAndroid();
    }
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
  onCreditsGranted = onSuccess;
  onPurchaseError = onError;

  // Listen for successful purchases
  purchaseUpdateSubscription = purchaseUpdatedListener(
    async (purchase: ProductPurchase) => {
      try {
        // Send receipt to our backend for validation and credit granting
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
          // Credits granted — finish the transaction with Apple
          await finishTransaction({ purchase, isConsumable: true });
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
  purchaseErrorSubscription = purchaseErrorListener(
    (error: PurchaseError) => {
      if (error.code === 'E_USER_CANCELLED') {
        onPurchaseError?.('Purchase cancelled.');
      } else {
        console.error('Purchase error:', error);
        onPurchaseError?.('Purchase failed. Please try again.');
      }
    },
  );

  // Return cleanup function
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
 * Returns product details (price, title, etc.).
 */
export async function loadProducts() {
  if (Platform.OS !== 'ios') return [];

  try {
    const products = await getProducts({ skus: PRODUCT_IDS });
    return products;
  } catch (err) {
    console.error('Failed to load IAP products:', err);
    return [];
  }
}

/**
 * Request purchase of a single analysis ($8.99).
 * The purchase listener handles the rest.
 */
export async function purchaseSingle(): Promise<void> {
  await requestPurchase({ sku: IAP_PRODUCTS.SINGLE });
}

/**
 * Request purchase of the competition pack ($29.99).
 * The purchase listener handles the rest.
 */
export async function purchasePack(): Promise<void> {
  await requestPurchase({ sku: IAP_PRODUCTS.PACK });
}

/**
 * Clean up IAP connection. Call on app shutdown.
 */
export async function cleanupIAP(): Promise<void> {
  if (Platform.OS !== 'ios') return;

  try {
    await endConnection();
  } catch {
    // Ignore cleanup errors
  }
}
