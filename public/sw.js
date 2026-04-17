// RoutineX / Coda service worker — minimal web push receiver.
// Kept dependency-free so it ships alongside the Next.js static assets.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = { title: "Coda", body: "You have a new update." };
  if (event.data) {
    try {
      payload = Object.assign(payload, event.data.json());
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: "/icon-192.png",
    badge: "/icon-badge.png",
    tag: payload.tag || "coda",
    data: { href: payload.href || "/" },
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = (event.notification.data && event.notification.data.href) || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((all) => {
        for (const c of all) {
          if (c.url.includes(href) && "focus" in c) return c.focus();
        }
        if (clients.openWindow) return clients.openWindow(href);
      })
  );
});
