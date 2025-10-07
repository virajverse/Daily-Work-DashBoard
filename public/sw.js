self.addEventListener("install", (event) => {
  self.skipWaiting()
})
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
  const getData = () => {
    try {
      return event.data?.json() || {}
    } catch {
      return {}
    }
  }
  const data = getData()
  const title = data.title || "Reminder"
  const body = data.body || "Open the app to view details."
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.jpg",
      badge: "/icons/icon-192.jpg",
      data: { url: data.url || "/" },
      tag: "push-task",
      renotify: true,
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification?.data?.url || "/"
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
      const client = allClients[0]
      if (client) {
        client.focus()
        client.navigate(url)
      } else {
        self.clients.openWindow(url)
      }
    })(),
  )
})
