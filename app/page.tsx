import { redirect } from "next/navigation"
import { isAuthed, logout } from "./server-actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { TaskTable } from "@/components/dashboard/task-table"
import { LeadTable } from "@/components/dashboard/lead-table"
import { RevenueExpenseChart } from "@/components/dashboard/revenue-expense-chart"
import { NotificationsPanel } from "@/components/dashboard/notifications-panel"

export default async function DashboardPage() {
  const authed = await isAuthed()
  if (!authed) redirect("/login")

  async function onLogout() {
    "use server"
    await logout()
    redirect("/login")
  }

  return (
    <main className="min-h-dvh p-4 md:p-6">
      <header className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-xl md:text-2xl font-semibold text-balance">Taliyo Technologies — 60-Day Client Plan</h1>
        <form action={onLogout}>
          <Button variant="secondary" type="submit" aria-label="Logout">
            Logout
          </Button>
        </form>
      </header>

      <section aria-label="Summary" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCards />
      </section>

      <section aria-label="Tasks" className="grid grid-cols-1 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Task Tracker</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TaskTable />
          </CardContent>
        </Card>
      </section>

      <section aria-label="Reminders" className="grid grid-cols-1 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Daily Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationsPanel />
          </CardContent>
        </Card>
      </section>

      <section aria-label="Leads" className="grid grid-cols-1 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Lead Tracker</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <LeadTable />
          </CardContent>
        </Card>
      </section>

      <section aria-label="Revenue vs Expense" className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Revenue vs Expense (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueExpenseChart />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
