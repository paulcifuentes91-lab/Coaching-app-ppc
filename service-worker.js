// Service Worker de Pro Performance Coach
// Estrategia network-first: SIEMPRE intenta buscar la version mas nueva
// desde internet primero (sin pasar por la cache HTTP del navegador),
// y solo cae a la copia guardada localmente si no hay conexion.
// Asi el Service Worker no agrega una capa extra de "stale" encima de la
// cache de 10 min que ya aplica el CDN de GitHub Pages.

const CACHE_NAME = 'ppc-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo intervenir en GET del mismo origen. Firebase/Firestore y otros
  // recursos externos pasan directo, sin tocar la cache.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req, { cache: 'no-store' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) =>
          cached || new Response('Sin conexión y sin copia guardada de esta página.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          })
        )
      )
  );
});
