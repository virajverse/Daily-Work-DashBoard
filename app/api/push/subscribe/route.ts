import { NextRequest, NextResponse } from 'next/server'

// In-memory storage (production me database use karo)
const subscriptions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscription, userId } = body

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    // Store subscription
    subscriptions.set(userId || 'default', subscription)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    count: subscriptions.size,
    subscriptions: Array.from(subscriptions.entries())
  })
}
