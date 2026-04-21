/**
 * StoreKit IAP bridge for RoutineX iOS.
 * Uses @capacitor-community/in-app-purchases for native StoreKit integration.
 * Products are validated server-side at /api/iap/verify.
 */

import { InAppPurchases } from '@capacitor-community/in-app-purchases';

export const PRODUCT_IDS = {
  single: 'routinex_single',       // $8.99 — 2 analyses (BOGO launch)
  pack: 'routinex_pack',           // $29.99 — 5 analyses (competition pack)
  monthly: 'routinex_monthly',     // $12.99/mo — 10 analyses/month
} as const;

export type ProductKey = keyof typeof PRODUCT_IDS;

interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceRaw: number;
  currency: string;
}

let products: Product[] = [];
let initialized = false;

export async function initIAP(): Promise<void> {
  if (initialized) return;

  await InAppPurchases.initialize();

  InAppPurchases.addListener('onPurchasesUpdated', async (event) => {
    for (const purchase of event.purchases) {
      if (purchase.state === 'purchased') {
        await verifyReceipt(purchase.receiptData, purchase.productId);
      }
    }
  });

  initialized = true;
}

export async function loadProducts(): Promise<Product[]> {
  const result = await InAppPurchases.getProducts({
    productIds: Object.values(PRODUCT_IDS),
  });
  products = result.products.map((p) => ({
    productId: p.productId,
    title: p.title,
    description: p.description,
    price: p.price,
    priceRaw: p.priceAmountMicros / 1_000_000,
    currency: p.currency,
  }));
  return products;
}

export async function purchase(key: ProductKey): Promise<void> {
  const productId = PRODUCT_IDS[key];
  await InAppPurchases.purchaseProduct({ productId });
}

export async function restorePurchases(): Promise<void> {
  await InAppPurchases.restorePurchases();
}

async function verifyReceipt(receiptData: string, productId: string): Promise<void> {
  const response = await fetch('https://routinex.org/api/iap/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receipt: receiptData,
      productId,
      platform: 'ios',
    }),
  });

  if (!response.ok) {
    console.error('Receipt verification failed:', await response.text());
    throw new Error('Receipt verification failed');
  }

  await InAppPurchases.completePurchase({ productId });
}
