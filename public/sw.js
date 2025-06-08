const CACHE_NAME = "restaurant-kpi-app-v1"
const urlsToCache = [
  "/",
  "/login",
  "/dashboard",
  "/sales",
  "/daily-input",
  "/monthly-input",
  "/staff-training",
  "/staff-management",
  "/settings",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// インストール時にキャッシュを設定
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// ネットワークリクエストをインターセプトしてキャッシュから返す
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュがあればそれを返す
      if (response) {
        return response
      }

      // キャッシュがなければネットワークからフェッチ
      return fetch(event.request).then((response) => {
        // 有効なレスポンスでなければそのまま返す
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // レスポンスをクローンしてキャッシュに保存
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})

// 古いキャッシュを削除
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
