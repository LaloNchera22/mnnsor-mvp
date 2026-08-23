/*
 * Service worker de mnnsor — captura offline.
 *
 * Estrategia:
 *  - Navegaciones (documentos HTML): network-first con fallback al shell
 *    cacheado, para que la app abra aunque no haya señal en la obra.
 *  - Estáticos de Next (/_next/static, fuentes, imágenes de marca):
 *    cache-first (son inmutables por hash).
 *  - Todo lo demás (APIs, terceros): se deja pasar a la red.
 *
 * La captura del usuario vive en localStorage (ver src/lib/store.tsx), así que
 * escribir notas sin conexión ya funciona; esto sólo garantiza que la app
 * cargue offline. En producción, la sincronización con Supabase se reintenta
 * al recuperar conexión (Background Sync / cola de reintentos).
 */

const VERSION = "mnnsor-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;

// Se pre-cachea sólo la raíz (fallback de navegación); el resto del shell se
// cachea al visitarlo. `addAll` es atómico, así que evitamos rutas frágiles.
const SHELL_URLS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/brand/") ||
    /\.(?:png|jpg|jpeg|svg|webp|woff2?|ico)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // deja pasar terceros/APIs

  // Navegaciones: network-first, fallback al shell cacheado.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return (
            cached ||
            (await caches.match("/")) ||
            new Response("Sin conexión", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }),
    );
    return;
  }

  // Estáticos: cache-first.
  if (isAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(ASSET_CACHE).then((c) => c.put(request, copy));
            return res;
          }),
      ),
    );
  }
});
