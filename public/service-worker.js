// Service Worker для OpenVerse-Chat-AI
const CACHE_NAME = 'claude-chat-v1';

// Ресурсы для предварительного кэширования
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.chunk.css',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Установка Service Worker и кэширование основных ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Error during cache.addAll():', err);
      })
  );
  // Активация сразу после установки
  self.skipWaiting();
});

// Активация Service Worker и очистка старых кэшей
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Уверены, что Service Worker будет использоваться для текущих и будущих клиентов
  self.clients.claim();
});

// Стратегия запросов: сначала сеть, потом кэш
self.addEventListener('fetch', event => {
  // Исключаем API-запросы от кэширования
  if (event.request.url.includes('puter.com')) {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request)
        .then(response => {
          // Если получен успешный ответ, кэшируем его
          if (event.request.method === 'GET' && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // При ошибке сети используем кэшированный ответ
          return cache.match(event.request);
        });
    })
  );
});

// Обработка сообщений от клиента
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Периодическое обновление кэша
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});

// Функция обновления кэша
async function updateCache() {
  const cache = await caches.open(CACHE_NAME);
  // Обновляем основные ресурсы
  for (const url of urlsToCache) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.error(`Failed to update cache for ${url}:`, error);
    }
  }
} 
