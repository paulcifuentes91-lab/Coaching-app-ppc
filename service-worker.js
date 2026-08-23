// Service Worker de Pro Performance Coach
// Estrategia network-first: SIEMPRE intenta buscar la version mas nueva
// desde internet primero (sin pasar por la cache HTTP del navegador),
// y solo cae a la copia guardada localmente si no hay conexion.
// Asi el Service Worker no agrega una capa extra de "stale" encima de la
// cache de 10 min que ya aplica el CDN de GitHub Pages.

const CACHE_NAME = 'ppc-cache-v1';

// ═══════════ NOTIFICACIONES PUSH (FCM) ═══════════
// El SW no puede leer el firebaseConfig de la pagina (corre en otro
// contexto/hilo) - se duplica aca, es el patron estandar de FCM Web
// (mismo que pide la documentacion oficial para firebase-messaging-sw.js).
// Se comparte entre los 14 atletas (mismo proyecto Firebase para todos).
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBtGeuSrw57EkNLFl4bMfkD5mGpqcwdd_I",
  authDomain: "pro-performance-e811e.firebaseapp.com",
  projectId: "pro-performance-e811e",
  storageBucket: "pro-performance-e811e.firebasestorage.app",
  messagingSenderId: "672514380516",
  appId: "1:672514380516:web:ce69f2aece5e2f77e112f1"
});

// Mensajes en SEGUNDO PLANO (app cerrada o en otra pestaña) - los mensajes
// en primer plano se manejan aparte, en cada plan-*.html (messaging.onMessage).
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const n = payload.notification || {};
  self.registration.showNotification(n.title || 'Pro Performance Coach', {
    body: n.body || '',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png'
  });
});

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
