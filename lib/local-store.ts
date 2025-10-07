"use client"

import useSWR, { mutate } from "swr"

export type TaskStatus = "done" | "pending"
export type TaskItem = {
  id: string
  date: string // YYYY-MM-DD
  task: string
  assignedTo: string
  status: TaskStatus
  notes?: string
}

export type LeadStatus = "New" | "Contacted" | "Closed"
export type LeadSource = "WhatsApp" | "Ads" | "Fiverr"
export type LeadItem = {
  id: string
  name: string
  source: LeadSource
  service: string
  status: LeadStatus
  value: number
  date?: string // optional for revenue grouping
}

const readLS = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
const writeLS = <T,>(key: string, value: T) => {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
  // inform SWR subscribers
  mutate(key, value, false)
}

export function useLocalList<T>(key: string, initial: T[]) {
  const { data } = useSWR<T[]>(key, () => Promise.resolve(readLS<T[]>(key, initial)), {
    fallbackData: initial,
    revalidateOnFocus: false,
  })
  const set = (next: T[]) => writeLS(key, next)
  const push = (item: T) => writeLS(key, [...(data || []), item])
  const update = (predicate: (item: T) => boolean, updater: (item: T) => T) => {
    const curr = data || []
    const next = curr.map((it) => (predicate(it) ? updater(it) : it))
    writeLS(key, next)
  }
  const remove = (predicate: (item: T) => boolean) => {
    const curr = data || []
    const next = curr.filter((it) => !predicate(it))
    writeLS(key, next)
  }
  return { data: data || initial, set, push, update, remove }
}

export function useMonthlyExpense() {
  const KEY = "monthlyExpense"
  const { data } = useSWR<number>(KEY, () => Promise.resolve(readLS<number>(KEY, 0)), {
    fallbackData: 0,
    revalidateOnFocus: false,
  })
  const set = (n: number) => writeLS(KEY, n)
  return { amount: data ?? 0, set }
}

export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
}
