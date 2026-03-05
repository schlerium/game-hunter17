const CACHE_NAME = "mosquito-game-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./game.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
