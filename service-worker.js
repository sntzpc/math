
const CACHE = 'math-pwa-v2';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './css/print-a4.css',
  './css/print-58.css',
  './js/utils.js',
  './js/db.js',
  './js/questions.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(req, copy));
      return res;
    }).catch(()=>cached))
  );
});
