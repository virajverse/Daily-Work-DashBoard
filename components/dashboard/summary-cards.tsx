"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocalList, type TaskItem, type LeadItem, formatINR } from "@/lib/local-store"

export function SummaryCards() {
  const { data: tasks } = useLocalList<TaskItem>("tasks", [])
  const { data: leads } = useLocalList<LeadItem>("leads", [])

  const totalClients = leads.filter((l) => l.status === "Closed").length
  const totalRevenue = leads
    .filter((l) => l.status === "Closed")
    .reduce((sum, l) => sum + (Number.isFinite(l.value) ? l.value : 0), 0)
  const tasksDone = tasks.filter((t) => t.status === "done").length
  const activeLeads = leads.filter((l) => l.status !== "Closed").length

  const items = [
    { title: "Total Clients", value: String(totalClients) },
    { title: "Total Revenue", value: formatINR(totalRevenue) },
    { title: "Tasks Completed", value: `${tasksDone} / 60` },
    { title: "Active Leads", value: String(activeLeads) },
  ]

  return (
    <>
      {items.map((it) => (
        <Card key={it.title} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{it.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-semibold">{it.value}</div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
