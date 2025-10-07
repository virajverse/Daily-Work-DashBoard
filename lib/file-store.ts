import { useEffect, useState } from 'react'

export type TaskItem = {
  id: string
  date: string
  task: string
  assignedTo: string
  status: 'pending' | 'done'
  notes: string
}

export type LeadItem = {
  id: string
  name: string
  source: 'WhatsApp' | 'Ads' | 'Fiverr'
  service: string
  status: 'New' | 'Contacted' | 'Closed'
  value: number
  date: string
}

type DataType = 'tasks' | 'leads'

// Hook for file-based storage
export function useFileStore<T>(type: DataType, initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)

  // Load data from server on mount
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/data/${type}`)
        if (response.ok) {
          const serverData = await response.json()
          setData(serverData)
        }
      } catch (error) {
        console.error(`Error loading ${type}:`, error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [type])

  // Save data to server whenever it changes
  useEffect(() => {
    if (loading) return // Don't save during initial load

    async function saveData() {
      try {
        await fetch(`/api/data/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } catch (error) {
        console.error(`Error saving ${type}:`, error)
      }
    }

    const timeoutId = setTimeout(saveData, 500) // Debounce saves
    return () => clearTimeout(timeoutId)
  }, [data, type, loading])

  const push = (item: T) => {
    setData((prev) => [...prev, item])
  }

  const update = (predicate: (item: T) => boolean, updater: (item: T) => T) => {
    setData((prev) => prev.map((item) => (predicate(item) ? updater(item) : item)))
  }

  const remove = (predicate: (item: T) => boolean) => {
    setData((prev) => prev.filter((item) => !predicate(item)))
  }

  const set = (newData: T[]) => {
    setData(newData)
  }

  return { data, push, update, remove, set, loading }
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}
