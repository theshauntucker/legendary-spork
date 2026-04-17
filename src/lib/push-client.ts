/**
 * Browser helper for enabling/disabling Web Push.
 * Safe to import in client components; all functions early-return on the
 * server or on unsupported browsers.
 */

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export function pushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window;
}

export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration("/");
    if (existing) return existing;
    return await navigator.serviceWorker.register("/sw.js");
  } catch (err) {
    console.warn("SW registration failed:", err);
    return null;
  }
}

export async function getPushPermission(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") return "denied";
  return Notification.permission;
}

export async function subscribePush(): Promise<{ success: boolean; error?: string }> {
  if (!pushSupported()) return { success: false, error: "Push not supported" };

  const reg = await ensureServiceWorker();
  if (!reg) return { success: false, error: "Service worker unavailable" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { success: false, error: "Permission denied" };
  }

  const vapidRes = await fetch("/api/push/vapid");
  if (!vapidRes.ok) return { success: false, error: "VAPID fetch failed" };
  const { publicKey } = (await vapidRes.json()) as { publicKey: string };

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    // Cast: TypeScript's latest Uint8Array<ArrayBufferLike> differs from the
    // BufferSource the PushManager typing expects. The value is valid at runtime.
    applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as ArrayBuffer,
  });

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...sub.toJSON(),
      userAgent: navigator.userAgent,
    }),
  });

  if (!res.ok) return { success: false, error: "Subscribe upload failed" };
  return { success: true };
}

export async function unsubscribePush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration("/");
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}`, {
    method: "DELETE",
  });
  await sub.unsubscribe();
}
