"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useLocalList, type LeadItem, formatINR, useMonthlyExpense } from "@/lib/local-store"

// Recharts imports
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function RevenueExpenseChart() {
  const { data: leads } = useLocalList<LeadItem>("leads", [])
  const { amount: monthlyExpense, set: setMonthlyExpense } = useMonthlyExpense()

  const data = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const perMonth = Array.from({ length: 12 }, (_, m) => ({
      month: monthNames[m],
      revenue: 0,
      expense: monthlyExpense || 0,
    }))
    for (const l of leads) {
      if (l.status !== "Closed") continue
      if (!l.date || isNaN(new Date(l.date).getTime())) continue
      const d = new Date(l.date)
      if (d.getFullYear() !== year) continue
      const m = d.getMonth()
      perMonth[m].revenue += Number(l.value) || 0
    }
    return perMonth
  }, [leads, monthlyExpense])

  const totalRevenue = data.reduce((s, r) => s + r.revenue, 0)
  const totalExpense = data.reduce((s, r) => s + r.expense, 0)

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="YTD Revenue" value={formatINR(totalRevenue)} />
        <Stat label="YTD Expense" value={formatINR(totalExpense)} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="monthly-expense">Monthly Expense (₹)</Label>
          <Input
            id="monthly-expense"
            type="number"
            inputMode="numeric"
            value={monthlyExpense}
            onChange={(e) => setMonthlyExpense(Number(e.target.value || 0))}
            aria-describedby="monthly-expense-help"
          />
          <p id="monthly-expense-help" className="text-xs text-muted-foreground">
            Set a single monthly expense to compare with revenue
          </p>
        </div>
      </div>

      <div className="w-full h-[280px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v: number, name) => [formatINR(v), name]} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-medium">{value}</div>
      </CardContent>
    </Card>
  )
}
