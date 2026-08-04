// Beeweat — Service Worker per le notifiche push (v2)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.title || "Beeweat 🐝", {
    body: d.body || "",
    data: d,
    tag: d.tag || "beeweat",
    renotify: true,          // ripeti l'avviso sonoro anche con lo stesso tag
    silent: false,           // chiedi esplicitamente suono/vibrazione di sistema
    vibrate: [120, 50, 120],
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const kind = (e.notification.data && e.notification.data.tag) || e.notification.tag || "";
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) {
      c.postMessage({ type: "notif-tap", kind });     // app già aperta: dille dove andare
      if ("focus" in c) return c.focus();
    }
    return clients.openWindow("/?notif=" + encodeURIComponent(kind));  // app chiusa: apri sulla destinazione
  }));
});
