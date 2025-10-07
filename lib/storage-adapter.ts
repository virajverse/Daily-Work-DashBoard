// Storage adapter - automatically switches between local files and Vercel KV

const isProduction = process.env.NODE_ENV === 'production'
const isVercel = process.env.VERCEL === '1'

// For Vercel production, use KV storage
// For local development, use file storage
export const useKVStorage = isProduction && isVercel

// KV Storage functions (for Vercel)
export async function getFromKV(key: string) {
  if (!useKVStorage) return null
  
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get(key)
  } catch {
    return null
  }
}

export async function setToKV(key: string, value: any) {
  if (!useKVStorage) return false
  
  try {
    const { kv } = await import('@vercel/kv')
    await kv.set(key, value)
    return true
  } catch {
    return false
  }
}

// File Storage functions (for local development)
export async function getFromFile(filePath: string) {
  if (useKVStorage) return null
  
  try {
    const { promises: fs } = await import('fs')
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

export async function setToFile(filePath: string, value: any) {
  if (useKVStorage) return false
  
  try {
    const { promises: fs } = await import('fs')
    const path = await import('path')
    const dir = path.dirname(filePath)
    
    // Ensure directory exists
    try {
      await fs.access(dir)
    } catch {
      await fs.mkdir(dir, { recursive: true })
    }
    
    await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}
