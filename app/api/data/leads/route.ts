import { NextRequest, NextResponse } from 'next/server'
import { getFromKV, setToKV, getFromFile, setToFile, useKVStorage } from '@/lib/storage-adapter'
import path from 'path'

const LEADS_FILE = path.join(process.cwd(), 'local-data', 'leads.json')
const KV_KEY = 'dashboard:leads'

// GET - Read leads
export async function GET() {
  try {
    let data
    
    if (useKVStorage) {
      // Production: Use Vercel KV
      data = await getFromKV(KV_KEY)
    } else {
      // Development: Use local files
      data = await getFromFile(LEADS_FILE)
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error reading leads:', error)
    return NextResponse.json({ error: 'Failed to read leads' }, { status: 500 })
  }
}

// POST - Save leads
export async function POST(request: NextRequest) {
  try {
    const leads = await request.json()
    
    let success
    if (useKVStorage) {
      // Production: Use Vercel KV
      success = await setToKV(KV_KEY, leads)
    } else {
      // Development: Use local files
      success = await setToFile(LEADS_FILE, leads)
    }
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      throw new Error('Storage operation failed')
    }
  } catch (error) {
    console.error('Error saving leads:', error)
    return NextResponse.json({ error: 'Failed to save leads' }, { status: 500 })
  }
}
