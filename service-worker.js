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
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBtGeuSrw57EkNLFl4bMfkD5mGpqcwdd_I",
  authDomain: "pro-performance-e811e.firebaseapp.com",
  projectId: "pro-performance-e811e",
  storageBucket: "pro-performance-e811e.firebasestorage.app",
  messagingSenderId: "672514380516",
  appId: "1:672514380516:web:ce69f2aece5e2f77e112f1"
};
firebase.initializeApp(FIREBASE_CONFIG);

// Mensajes en SEGUNDO PLANO (app cerrada o en otra pestaña) - los mensajes
// en primer plano se manejan aparte, en cada plan-*.html (messaging.onMessage).
// El servidor (scripts/recordatorios.js) manda el payload como "data", NO
// "notification" - un payload "notification" hace que FCM muestre el push
// automaticamente ADEMAS de este handler, duplicando cada notificacion.
// Con data-only, este es el UNICO lugar que decide mostrarla.
//
// "image" (imagen ancha) y "actions" (botones) solo los soportan Chrome/
// Edge/Firefox - Safari (macOS e iOS) los ignora sin fallar, el atleta ve
// el push normal con icon+title+body igual. No hace falta detectar el
// navegador: simplemente se omiten esas opciones si el payload no las trae
// (hoy solo se mandan para el atleta del prototipo, ver RICH_NOTIF_ATLETAS
// en recordatorios.js).
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const n = payload.data || {};
  let actions = [];
  try { actions = n.actions ? JSON.parse(n.actions) : []; } catch (e) { /* payload sin acciones */ }

  const options = {
    body: n.body || '',
    icon: n.icon || './icons/icon-192.png',
    badge: './icons/icon-192.png',
    data: n // se reusa en notificationclick (url, athleteId, dedupKey)
  };
  if (n.image) options.image = n.image;
  if (actions.length) options.actions = actions;

  // "return" es obligatorio: sin el, esta promesa queda sin esperar y el
  // navegador puede matar el service worker apenas termina la parte
  // sincrona del callback, cortando showNotification() a medio construir -
  // el push SI llega (por eso aparecia algun indicador en el telefono) pero
  // la ventana de la notificacion nunca se termina de mostrar.
  return self.registration.showNotification(n.title || 'Pro Performance Coach', options);
});

// Click en la notificacion o en uno de sus botones.
// "marcar_hecho": escribe la confirmacion directo en Firestore, SIN abrir
// la app - el atleta no tiene que hacer nada mas.
// "ver_plan" o tap en el cuerpo (sin action): abre/enfoca la app en la
// pestaña relevante (n.url ya trae "?vista=...", ver VISTA_POR_REGLA en
// recordatorios.js). Si ya hay una pestaña de esa app abierta, la enfoca
// en vez de abrir una nueva.
self.addEventListener('notificationclick', (event) => {
  const n = event.notification.data || {};
  event.notification.close();

  if (event.action === 'marcar_hecho') {
    event.waitUntil(marcarHechoEnFirestore(n));
    return;
  }

  const url = n.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const destino = new URL(url, self.location.href);
      for (const client of windowClients) {
        if (new URL(client.url).pathname === destino.pathname && 'focus' in client) {
          if ('navigate' in client) client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

async function marcarHechoEnFirestore(n) {
  if (!n.athleteId || !n.dedupKey) return;
  try {
    const db = firebase.firestore();
    await db.collection('athletes').doc(n.athleteId).set({
      recordatorioConfirmaciones: { [n.dedupKey]: true }
    }, { merge: true });
  } catch (e) { /* silencioso - no hay UI en el SW para mostrar el error */ }
}

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
