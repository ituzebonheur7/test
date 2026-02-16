const CACHE_NAME = 'ituze-new-tab-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'styles.css',
  'shared.css',
  'core.js',
  'ui.js',
  'theme.js',
  'games.html',
  'games.css',
  'games.js',
  'settings.html',
  'settings.css',
  'settings.js',
  'three.min.js',
  'vanta.min.js',
  'icon-192.png',
  'icon-512.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap',
  'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq-FFc-B-V1wc0.woff2',
  'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq-FFc-B-V4wc0.woff2',
  'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq-FFc-B-VzAc0.woff2',
  'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq-FFc-B-VwQc0.woff2',
  'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq-FFc-B-V2wc0.woff2',
  'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq-FFc-B-V7Qc0.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
