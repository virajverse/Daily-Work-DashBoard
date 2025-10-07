import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage (production me database use karo)
let storedSubscriptions: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, userId } = body

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message required' }, { status: 400 })
    }

    // Get all subscriptions
    const subs = userId 
      ? storedSubscriptions.filter(s => s.userId === userId)
      : storedSubscriptions

    if (subs.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 })
    }

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        const response = await fetch(sub.subscription.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '86400',
          },
          body: JSON.stringify({
            title,
            body: message,
            icon: '/icons/icon-192.jpg',
            badge: '/icons/icon-192.jpg',
          }),
        })
        return response.ok
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled').length

    return NextResponse.json({ 
      success: true, 
      sent: successful,
      total: subs.length 
    })
  } catch (error) {
    console.error('Send push error:', error)
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 })
  }
}

// Helper to store subscriptions
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscription, userId } = body
    
    storedSubscriptions = storedSubscriptions.filter(s => s.userId !== userId)
    storedSubscriptions.push({ userId: userId || 'default', subscription })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to store' }, { status: 500 })
  }
}
