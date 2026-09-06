/* Isha Connect — Service Worker for offline caching and push notifications */

const CACHE = "isha-connect-v1";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached ?? fetchPromise;
    }),
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "Isha Connect", body: "", icon: "/favicon.ico", url: "/" };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.title = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: "/favicon.ico",
    data: { url: data.url },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(clients.openWindow(url));
});
