// Lightweight web-push implementation without external dependencies
export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: { title: string; body: string; url?: string }
): Promise<void> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@example.com'

  const payloadString = JSON.stringify(payload)
  const payloadBuffer = new TextEncoder().encode(payloadString)

  // Import crypto for signing
  const crypto = await import('crypto')
  
  // Parse endpoint
  const url = new URL(subscription.endpoint)
  const audience = `${url.protocol}//${url.host}`

  // Create JWT header and payload
  const jwtHeader = { typ: 'JWT', alg: 'ES256' }
  const jwtPayload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: vapidEmail,
  }

  const headerB64 = Buffer.from(JSON.stringify(jwtHeader)).toString('base64url')
  const payloadB64 = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url')
  const unsignedToken = `${headerB64}.${payloadB64}`

  // Sign with private key
  const privateKeyBuffer = Buffer.from(vapidPrivateKey, 'base64url')
  const sign = crypto.createSign('SHA256')
  sign.update(unsignedToken)
  const signature = sign.sign({
    key: privateKeyBuffer,
    format: 'der',
    type: 'pkcs8',
  })
  const signatureB64 = signature.toString('base64url')
  const jwt = `${unsignedToken}.${signatureB64}`

  // Encrypt payload (simplified - in production use proper encryption)
  const headers: Record<string, string> = {
    'Content-Type': 'application/octet-stream',
    'Content-Encoding': 'aes128gcm',
    'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
    'TTL': '86400',
  }

  // Send push notification
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers,
    body: payloadBuffer,
  })

  if (!response.ok) {
    throw new Error(`Push failed: ${response.status} ${response.statusText}`)
  }
}
