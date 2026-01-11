const CACHE_NAME = 'penko-v1.4.1-tier12'; // Binary dictionaries with msgpack + PNG icons
const MODEL_CACHE_NAME = 'penko-local-model'; // Virtual file system cache
const ASSETS = [
  // PWA Icons
  '/icon-192.png',
  '/icon-512.png',
  '/penguin-logo.svg',
  // TIER 12: Pre-cache binary dictionary and morphology files (13.58 MB total)
  // Dictionaries (.pbd.gz) - 67% smaller than JSON
  '/assets/dictionaries-bin/en-cs.pbd.gz',
  '/assets/dictionaries-bin/en-de.pbd.gz',
  '/assets/dictionaries-bin/en-es.pbd.gz',
  '/assets/dictionaries-bin/en-fr.pbd.gz',
  '/assets/dictionaries-bin/en-it.pbd.gz',
  '/assets/dictionaries-bin/en-ja.pbd.gz',
  '/assets/dictionaries-bin/en-pl.pbd.gz',
  '/assets/dictionaries-bin/en-pt.pbd.gz',
  '/assets/dictionaries-bin/en-ru.pbd.gz',
  '/assets/dictionaries-bin/en-uk.pbd.gz',
  '/assets/dictionaries-bin/en-zh.pbd.gz',
  '/assets/dictionaries-bin/fr-en.pbd.gz',
  // Morphology (.pbm.gz) - 83% smaller than JSON
  '/assets/morphology-bin/czech.pbm.gz',
  '/assets/morphology-bin/french.pbm.gz',
  '/assets/morphology-bin/german.pbm.gz',
  '/assets/morphology-bin/italian.pbm.gz',
  '/assets/morphology-bin/japanese.pbm.gz',
  '/assets/morphology-bin/mandarin.pbm.gz',
  '/assets/morphology-bin/polish.pbm.gz',
  '/assets/morphology-bin/portuguese.pbm.gz',
  '/assets/morphology-bin/russian.pbm.gz',
  '/assets/morphology-bin/spanish.pbm.gz',
  '/assets/morphology-bin/ukrainian.pbm.gz'
];

// Install Event
self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event (Cleanup old caches)
self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            // Keep app cache and model cache, delete everything else
            if (key !== CACHE_NAME && key !== MODEL_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// Fetch Event (Virtual File System + Cache First Strategy)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 1. VIRTUAL FILE SYSTEM: Serve /local-model/* from cache
  if (url.includes('/local-model/')) {
    // CRITICAL FIX: Don't intercept Range requests - let browser handle them natively
    // Caching large files and serving Range requests causes memory explosion
    // Instead, just pass through to cache which browser handles efficiently
    event.respondWith(
      caches.open(MODEL_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
          console.log('[SW] Cache hit:', url);
          return cachedResponse;
        }

        console.warn('[SW] Model file not found in cache:', url);
        return new Response('Model file not found', { status: 404 });
      })
    );
    return;
  }

  // 2. BYPASS: Let HuggingFace CDN requests pass through completely (don't intercept!)
  if (url.includes('huggingface.co') || url.includes('hf.co') || url.includes('xethub.hf.co') || url.includes('cas-bridge')) {
    // Don't call event.respondWith() - just return and let browser handle it natively
    return;
  }

  // 3. BYPASS: Let local LLM service requests (Ollama, OpenAI-compatible API) pass through
  if (url.includes('localhost:11434') || url.includes('localhost:1234') || url.includes('127.0.0.1:11434') || url.includes('127.0.0.1:1234')) {
    // Don't call event.respondWith() - just return and let browser handle them directly to avoid CORS issues
    return;
  }

  // 4. STANDARD: Cache-first for app assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
