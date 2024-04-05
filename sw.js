const staticCacheName = "app-s1";

const dynamicCache = "app-d1";

const assetsUrl = ["index.html", "js/main.js", "css/main.css", "offline.html"];

self.addEventListener("install", async (event) => {
  const cache = await caches.open(staticCacheName);

  await cache.addAll(assetsUrl);
});

self.addEventListener("activate", async (event) => {
  const cacheNames = await caches.keys();

  await Promise.all(
    cacheNames
      .filter((name) => name !== staticCacheName)
      .map((name) => caches.delete(name))
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  const url = new URL(request.url);

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);

  return cached ?? (await fetch(request));
}

async function networkFirst(request) {
  const cache = await caches.open(dynamicCache);

  try {
    const response = await fetch(request);
    await cache.put(request, response.clone());
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    return cached ?? (await caches.match("/offline.html"));
  }
}
