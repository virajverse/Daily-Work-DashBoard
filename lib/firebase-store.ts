import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, setDoc, getDocs } from 'firebase/firestore'
import { db } from './firebase'

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

// Hook for Firebase Firestore storage with real-time sync
export function useFirebaseStore<T extends { id: string }>(type: DataType, initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)

  // Real-time listener
  useEffect(() => {
    const collectionRef = collection(db, type)
    
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[]
        setData(items)
        setLoading(false)
      },
      (error) => {
        console.error(`Error loading ${type}:`, error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [type])

  const push = async (item: T) => {
    try {
      await setDoc(doc(db, type, item.id), item)
      // Real-time listener will update automatically
    } catch (error) {
      console.error(`Error adding ${type}:`, error)
    }
  }

  const update = async (predicate: (item: T) => boolean, updater: (item: T) => T) => {
    try {
      const itemToUpdate = data.find(predicate)
      if (itemToUpdate) {
        const updated = updater(itemToUpdate)
        await setDoc(doc(db, type, updated.id), updated)
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error)
    }
  }

  const remove = async (predicate: (item: T) => boolean) => {
    try {
      const itemToRemove = data.find(predicate)
      if (itemToRemove) {
        await setDoc(doc(db, type, itemToRemove.id), { ...itemToRemove, _deleted: true })
        // Or use deleteDoc if you want to actually delete
        // await deleteDoc(doc(db, type, itemToRemove.id))
      }
    } catch (error) {
      console.error(`Error removing ${type}:`, error)
    }
  }

  const set = async (newData: T[]) => {
    try {
      // Batch update all items
      const promises = newData.map((item) => setDoc(doc(db, type, item.id), item))
      await Promise.all(promises)
    } catch (error) {
      console.error(`Error setting ${type}:`, error)
    }
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
