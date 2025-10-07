import { NextRequest, NextResponse } from 'next/server'

// Ye route cron job se call hoga (Vercel Cron ya external service)
export async function GET(request: NextRequest) {
  try {
    // Check authorization (production me proper auth use karo)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Send notification to all subscribed users
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Aaj ka task hai',
        message: 'Aaj ka task dekhne ke liye app kholo.',
      }),
    })

    const result = await response.json()

    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      result 
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}
