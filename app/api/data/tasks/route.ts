import { NextRequest, NextResponse } from 'next/server'
import { getFromKV, setToKV, getFromFile, setToFile, useKVStorage } from '@/lib/storage-adapter'
import path from 'path'

const TASKS_FILE = path.join(process.cwd(), 'local-data', 'tasks.json')
const KV_KEY = 'dashboard:tasks'

// GET - Read tasks
export async function GET() {
  try {
    let data

    if (useKVStorage) {
      // Production: Use Vercel KV
      data = await getFromKV(KV_KEY)
    } else {
      // Development: Use local files
      data = await getFromFile(TASKS_FILE)
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error reading tasks:', error)
    return NextResponse.json({ error: 'Failed to read tasks' }, { status: 500 })
  }
}

// POST - Save tasks
export async function POST(request: NextRequest) {
  try {
    const tasks = await request.json()

    let success
    if (useKVStorage) {
      // Production: Use Vercel KV
      success = await setToKV(KV_KEY, tasks)
    } else {
      // Development: Use local files
      success = await setToFile(TASKS_FILE, tasks)
    }

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      throw new Error('Storage operation failed')
    }
  } catch (error) {
    console.error('Error saving tasks:', error)
    return NextResponse.json({ error: 'Failed to save tasks' }, { status: 500 })
  }
}
