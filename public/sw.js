const CACHE_NAME = 'quickpoll-v2'
const SHELL = [
  '/',
  '/index.html',
  '/icons/icon-192-light.png',
  '/icons/icon-192-dark.png',
  '/icons/icon-512-light.png',
  '/icons/icon-512-dark.png',
  '/icons/icon-512-maskable-light.png',
  '/icons/icon-512-maskable-dark.png',
  '/screenshots/screenshot-create.png',
  '/screenshots/screenshot-results.png'
]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('api.twz00.dev') || e.request.url.includes('googleapis.com')) return
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
