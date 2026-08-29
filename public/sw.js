// Beeweat — Service Worker: notifiche push + cassaforte modelli AI (v5)
const AI_CACHE = "bw-ai-v1";
const AI_HOSTS = /(tfhub\.dev|storage\.googleapis\.com|cdn\.jsdelivr\.net|unpkg\.com|kaggle)/;
self.addEventListener("fetch", e => {
  const url = e.request.url;
  if (e.request.method !== "GET" || !AI_HOSTS.test(url)) return;   // tutto il resto passa dritto
  e.respondWith(
    caches.open(AI_CACHE).then(async cache => {
      const hit = await cache.match(e.request);
      if (hit) return hit;                                          // dalla cassaforte: zero rete
      const res = await fetch(e.request);
      if (res && res.ok) cache.put(e.request, res.clone());
      return res;
    })
  );
});
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
  const d = e.notification.data || {};
  const kind = d.tag || e.notification.tag || "";
  const from = d.from || "";
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) {
      c.postMessage({ type: "notif-tap", kind, from });   // app già aperta: dille dove andare
      if ("focus" in c) return c.focus();
    }
    return clients.openWindow("/?notif=" + encodeURIComponent(kind) + (from ? "&from=" + encodeURIComponent(from) : ""));
  }));
});
