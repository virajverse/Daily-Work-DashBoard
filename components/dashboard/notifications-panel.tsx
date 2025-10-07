"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

type PermissionState = "default" | "granted" | "denied"

function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function setLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

async function showNotification(title: string, body: string) {
  try {
    const reg = window.__swRegistration
    const options = {
      body,
      icon: "/icons/icon-192.jpg",
      badge: "/icons/icon-192.jpg",
      tag: "daily-task",
      renotify: true,
      data: { url: "/" },
    }
    if (reg?.showNotification) {
      await reg.showNotification(title, options)
      return
    }
    if ("Notification" in window) {
      new Notification(title, options as NotificationOptions)
    }
  } catch {}
}

function nowHM() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${hh}:${mm}`
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function NotificationsPanel() {
  const { toast } = useToast()
  const [enabled, setEnabled] = useState<boolean>(false)
  const [time, setTime] = useState<string>("09:00")
  const [permission, setPermission] = useState<PermissionState>("default")
  const [installReady, setInstallReady] = useState<boolean>(false)
  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(false)

  useEffect(() => {
    setEnabled(getLocal<boolean>("dailyReminderEnabled", false))
    setTime(getLocal<string>("dailyReminderTime", "09:00"))
    setPermission(((typeof Notification !== "undefined" && Notification.permission) || "default") as PermissionState)
    setIsPushSubscribed(getLocal<boolean>("pushSubscribed", false))
    const updateInstall = () => setInstallReady(Boolean(window.__deferredPrompt))
    updateInstall()
    window.addEventListener("beforeinstallprompt", updateInstall as EventListener)
    return () => window.removeEventListener("beforeinstallprompt", updateInstall as EventListener)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const id = setInterval(async () => {
      const current = nowHM()
      const lastFiredRaw = localStorage.getItem("dailyReminderLastFired")
      const lastFired = lastFiredRaw ? new Date(lastFiredRaw) : undefined
      if (current === time && (!lastFired || !sameDay(new Date(), lastFired))) {
        await showNotification("Aaj ka task hai", "Aaj ka task dekhne ke liye app kholo.")
        localStorage.setItem("dailyReminderLastFired", new Date().toISOString())
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [enabled, time])

  const canRequest = useMemo(() => permission === "default", [permission])

  async function requestPerm() {
    if (typeof Notification === "undefined") return
    try {
      const res = await Notification.requestPermission()
      setPermission(res as PermissionState)
    } catch {}
  }

  function toggleEnabled(next: boolean) {
    if (next && permission !== "granted") {
      requestPerm().then(() => {
        if (Notification.permission === "granted") {
          setEnabled(true)
          setLocal("dailyReminderEnabled", true)
        }
      })
      return
    }
    setEnabled(next)
    setLocal("dailyReminderEnabled", next)
  }

  function changeTime(v: string) {
    setTime(v)
    setLocal("dailyReminderTime", v)
    localStorage.removeItem("dailyReminderLastFired")
  }

  async function testNow() {
    if (permission !== "granted") await requestPerm()
    if (Notification.permission === "granted") {
      await showNotification("Reminder test", "Yeh ek test notification hai.")
    }
  }

  async function installApp() {
    const e = window.__deferredPrompt
    if (!e) return
    try {
      await e.prompt()
      await e.userChoice
      window.__deferredPrompt = null
      setInstallReady(false)
    } catch {}
  }

  async function subscribeToPush() {
    try {
      if (permission !== "granted") {
        await requestPerm()
        if (Notification.permission !== "granted") {
          toast({ title: "Permission denied", description: "Notifications ko allow karo" })
          return
        }
      }

      // Get VAPID public key from API
      const keyResponse = await fetch('/api/vapid-key')
      const { publicKey } = await keyResponse.json()
      
      if (!publicKey) {
        toast({ title: "Error", description: "VAPID key not found" })
        return
      }

      const reg = await navigator.serviceWorker.ready
      
      // Convert VAPID key
      const convertedKey = urlBase64ToUint8Array(publicKey)
      
      // Subscribe
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as BufferSource,
      })

      // Send to server
      const response = await fetch('/api/push/send', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: 'default',
        }),
      })

      if (response.ok) {
        setIsPushSubscribed(true)
        setLocal("pushSubscribed", true)
        toast({ title: "Success!", description: "Push notifications enabled ho gaye" })
      }
    } catch (error) {
      console.error('Push subscribe error:', error)
      toast({ title: "Error", description: "Push notifications enable nahi ho paye" })
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Daily Reminder Toggle */}
          <div className="flex items-center gap-3">
            <Switch id="daily-enabled" checked={enabled} onCheckedChange={toggleEnabled} />
            <div className="flex-1">
              <Label htmlFor="daily-enabled" className="block">
                Daily Reminder
              </Label>
              <p className="text-sm text-muted-foreground">
                {permission === "granted"
                  ? "Notifications enabled"
                  : permission === "denied"
                    ? "Permission denied"
                    : "Permission required"}
              </p>
            </div>
          </div>

          {/* Time Picker and Test Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label htmlFor="reminder-time" className="whitespace-nowrap">Time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={time}
                onChange={(e) => changeTime(e.target.value)}
                className="w-36"
              />
            </div>
            <Button 
              variant="secondary" 
              type="button" 
              onClick={testNow} 
              aria-label="Send test notification"
              className="w-full sm:w-auto"
            >
              Test Notification
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              onClick={subscribeToPush} 
              disabled={isPushSubscribed}
              variant={isPushSubscribed ? "secondary" : "default"}
              className="w-full sm:flex-1"
            >
              {isPushSubscribed ? "Push Enabled ✓" : "Enable Push Notifications"}
            </Button>
            <Button 
              type="button" 
              onClick={installApp} 
              disabled={!installReady}
              className="w-full sm:w-auto"
            >
              {installReady ? "Install App" : "Installed/Unavailable"}
            </Button>
          </div>

          {/* Status Message */}
          <p className="text-sm text-muted-foreground">
            {isPushSubscribed 
              ? "✓ Push notifications enabled - App band hone pe bhi notifications aayenge" 
              : "Note: Push notifications enable karo taki app band hone pe bhi notifications aaye"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
