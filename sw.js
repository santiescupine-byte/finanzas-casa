// Service worker mínimo. Estrategia RED-PRIMERO: siempre intenta la versión más nueva;
// si no hay internet, sirve lo último que cargó. Habilita "Instalar" de la PWA.
const CACHE = 'finanzas-cache-v1';

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;            // no tocar escrituras
  if (new URL(req.url).hostname.endsWith('supabase.co')) return;   // datos: nunca desde caché
  e.respondWith(
    fetch(req)
      .then((res) => {
        try {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        } catch (_) {}
        return res;
      })
      .catch(() => caches.match(req))          // sin internet → último guardado
  );
});
