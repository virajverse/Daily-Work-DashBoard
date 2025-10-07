"use client"

import type React from "react"

import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFileStore, type TaskItem } from "@/lib/file-store"
import { cn } from "@/lib/utils"
import Papa from "papaparse"
import jsPDF from "jspdf"
import "jspdf-autotable"

const emptyRow: TaskItem = {
  id: "",
  date: new Date().toISOString().slice(0, 10),
  task: "",
  assignedTo: "Viraj",
  status: "pending",
  notes: "",
}

export function TaskTable() {
  const { data, push, update, remove, set, loading } = useFileStore<TaskItem>("tasks", [])
  const [draft, setDraft] = useState<TaskItem>(emptyRow)

  const fileRef = useRef<HTMLInputElement>(null)
  const [replaceOnImport, setReplaceOnImport] = useState(false)

  const canAdd = useMemo(() => draft.task.trim().length > 0 && !!draft.date, [draft.task, draft.date])

  const onAdd = () => {
    if (!canAdd) return
    const row: TaskItem = { ...draft, id: crypto.randomUUID() }
    push(row)
    setDraft({ ...emptyRow, date: new Date().toISOString().slice(0, 10) })
  }

  const normalizeRow = (raw: any): TaskItem | null => {
    const date = (raw.date || raw.Date || "").toString().slice(0, 10)
    const task = (raw.task || raw.Task || "").toString().trim()
    if (!date || !task) return null

    const assignedTo =
      (raw.assignedTo || raw["assigned_to"] || raw.AssignedTo || raw["Assigned To"] || "Viraj")?.toString() || "Viraj"

    const statusRaw = (raw.status || raw.Status || "").toString().toLowerCase()
    const status: TaskItem["status"] = statusRaw === "done" ? "done" : "pending"

    const notes = (raw.notes || raw.Notes || "").toString()
    const id = (raw.id || raw.ID || "").toString().trim() || crypto.randomUUID()

    return { id, date, task, assignedTo, status, notes }
  }

  const onImportClick = () => fileRef.current?.click()

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed = Array.isArray(result.data) ? (result.data as any[]) : []
        const rows = parsed.map(normalizeRow).filter(Boolean) as TaskItem[]
        if (rows.length === 0) {
          alert("No valid rows found in CSV. Ensure headers include: date, task, assignedTo, status, notes.")
        } else {
          if (replaceOnImport) {
            set(rows)
          } else {
            set([...(data || []), ...rows])
          }
        }
      },
      error: () => {
        alert("Failed to parse CSV. Please try again.")
      },
    })
    e.target.value = ""
  }

  const onExportCsv = () => {
    const csv = Papa.unparse(
      (data || []).map((r) => ({
        id: r.id,
        date: r.date,
        task: r.task,
        assignedTo: r.assignedTo,
        status: r.status,
        notes: r.notes ?? "",
      })),
    )
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "tasks.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const onExportPdf = () => {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text("Task Tracker", 14, 14)
    doc.autoTable({
      startY: 20,
      head: [["Date", "Task", "Assigned To", "Status", "Notes"]],
      body: (data || []).map((r) => [r.date, r.task, r.assignedTo, r.status, r.notes ?? ""]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [33, 33, 33], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 70 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: "auto" },
      },
    })
    doc.save("tasks.pdf")
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading tasks...
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border-b">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={onImportClick} className="flex-1 sm:flex-none">
            Import CSV
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onFileChange}
            aria-hidden
          />
          <Button variant="outline" size="sm" onClick={onExportCsv} className="flex-1 sm:flex-none">
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPdf} className="flex-1 sm:flex-none">
            Export PDF
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Switch id="replace-import" checked={replaceOnImport} onCheckedChange={setReplaceOnImport} />
          <Label htmlFor="replace-import" className="text-sm">Replace on import</Label>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Date</TableHead>
            <TableHead className="min-w-[220px]">Task</TableHead>
            <TableHead className="min-w-[140px]">Assigned To</TableHead>
            <TableHead className="min-w-[120px]">Status</TableHead>
            <TableHead className="min-w-[200px]">Notes</TableHead>
            <TableHead className="w-[1%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="bg-muted/30">
            <TableCell>
              <Input
                type="date"
                value={draft.date}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              />
            </TableCell>
            <TableCell>
              <Input
                placeholder="Describe the task"
                value={draft.task}
                onChange={(e) => setDraft((d) => ({ ...d, task: e.target.value }))}
              />
            </TableCell>
            <TableCell>
              <Input
                placeholder="Assigned to"
                value={draft.assignedTo}
                onChange={(e) => setDraft((d) => ({ ...d, assignedTo: e.target.value }))}
              />
            </TableCell>
            <TableCell>
              <Select
                value={draft.status}
                onValueChange={(v) => setDraft((d) => ({ ...d, status: v as TaskItem["status"] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">⏳ Pending</SelectItem>
                  <SelectItem value="done">✅ Done</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Input
                placeholder="Notes"
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              />
            </TableCell>
            <TableCell className="text-right">
              <Button onClick={onAdd} disabled={!canAdd} size="sm">
                Add
              </Button>
            </TableCell>
          </TableRow>

          {data.map((row) => (
            <EditableTaskRow key={row.id} row={row} onUpdate={update} onRemove={remove} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function EditableTaskRow({
  row,
  onUpdate,
  onRemove,
}: {
  row: TaskItem
  onUpdate: ReturnType<typeof useFileStore<TaskItem>>["update"]
  onRemove: ReturnType<typeof useFileStore<TaskItem>>["remove"]
}) {
  const [local, setLocal] = useState(row)
  const changed = JSON.stringify(local) !== JSON.stringify(row)

  return (
    <TableRow>
      <TableCell>
        <Input type="date" value={local.date} onChange={(e) => setLocal((d) => ({ ...d, date: e.target.value }))} />
      </TableCell>
      <TableCell>
        <Input value={local.task} onChange={(e) => setLocal((d) => ({ ...d, task: e.target.value }))} />
      </TableCell>
      <TableCell>
        <Input value={local.assignedTo} onChange={(e) => setLocal((d) => ({ ...d, assignedTo: e.target.value }))} />
      </TableCell>
      <TableCell>
        <Select
          value={local.status}
          onValueChange={(v) => setLocal((d) => ({ ...d, status: v as TaskItem["status"] }))}
        >
          <SelectTrigger className={cn(local.status === "done" ? "text-green-600" : "text-foreground")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">⏳ Pending</SelectItem>
            <SelectItem value="done">✅ Done</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input value={local.notes} onChange={(e) => setLocal((d) => ({ ...d, notes: e.target.value }))} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 justify-end">
          <Button
            variant="secondary"
            size="sm"
            disabled={!changed}
            onClick={() =>
              onUpdate(
                (it) => it.id === row.id,
                () => local,
              )
            }
            className="w-full sm:w-auto"
          >
            Save
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onRemove((it) => it.id === row.id)}
            className="w-full sm:w-auto"
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
