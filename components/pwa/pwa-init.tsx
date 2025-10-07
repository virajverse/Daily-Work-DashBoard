"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    __swRegistration?: ServiceWorkerRegistration
    __deferredPrompt?: any
  }
}

function PWAInit() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          window.__swRegistration = reg
        })
        .catch((err) => {
          // optional debug
          // console.log("SW registration failed:", err)
        })
    }
    const handler = (e: Event) => {
      e.preventDefault()
      window.__deferredPrompt = e
    }
    window.addEventListener("beforeinstallprompt", handler as EventListener)
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener)
  }, [])

  return null
}

export default PWAInit
