"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLocalList, type LeadItem, type LeadSource, type LeadStatus } from "@/lib/local-store"

const emptyLead: LeadItem = {
  id: "",
  name: "",
  source: "WhatsApp",
  service: "",
  status: "New",
  value: 0,
  date: new Date().toISOString().slice(0, 10),
}

const sources: LeadSource[] = ["WhatsApp", "Ads", "Fiverr"]
const statuses: LeadStatus[] = ["New", "Contacted", "Closed"]

export function LeadTable() {
  const { data, push, update, remove } = useLocalList<LeadItem>("leads", [])
  const [draft, setDraft] = useState<LeadItem>(emptyLead)

  const canAdd = useMemo(
    () => draft.name.trim().length > 0 && draft.service.trim().length > 0,
    [draft.name, draft.service],
  )

  const onAdd = () => {
    if (!canAdd) return
    const row: LeadItem = { ...draft, id: crypto.randomUUID(), value: Number(draft.value) || 0 }
    push(row)
    setDraft({ ...emptyLead, date: new Date().toISOString().slice(0, 10) })
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[160px]">Name</TableHead>
            <TableHead className="min-w-[140px]">Source</TableHead>
            <TableHead className="min-w-[180px]">Service</TableHead>
            <TableHead className="min-w-[140px]">Status</TableHead>
            <TableHead className="min-w-[140px]">Value (₹)</TableHead>
            <TableHead className="min-w-[120px]">Date</TableHead>
            <TableHead className="w-[1%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="bg-muted/30">
            <TableCell>
              <Input
                placeholder="Lead name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </TableCell>
            <TableCell>
              <Select
                value={draft.source}
                onValueChange={(v) => setDraft((d) => ({ ...d, source: v as LeadItem["source"] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Input
                placeholder="Service"
                value={draft.service}
                onChange={(e) => setDraft((d) => ({ ...d, service: e.target.value }))}
              />
            </TableCell>
            <TableCell>
              <Select
                value={draft.status}
                onValueChange={(v) => setDraft((d) => ({ ...d, status: v as LeadItem["status"] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={draft.value}
                onChange={(e) => setDraft((d) => ({ ...d, value: Number(e.target.value || 0) }))}
              />
            </TableCell>
            <TableCell>
              <Input
                type="date"
                value={draft.date || ""}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              />
            </TableCell>
            <TableCell className="text-right">
              <Button onClick={onAdd} disabled={!canAdd} size="sm">
                Add
              </Button>
            </TableCell>
          </TableRow>

          {data.map((row) => (
            <EditableLeadRow key={row.id} row={row} onUpdate={update} onRemove={remove} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function EditableLeadRow({
  row,
  onUpdate,
  onRemove,
}: {
  row: LeadItem
  onUpdate: ReturnType<typeof useLocalList<LeadItem>>["update"]
  onRemove: ReturnType<typeof useLocalList<LeadItem>>["remove"]
}) {
  const [local, setLocal] = useState(row)
  const changed = JSON.stringify(local) !== JSON.stringify(row)

  return (
    <TableRow>
      <TableCell>
        <Input value={local.name} onChange={(e) => setLocal((d) => ({ ...d, name: e.target.value }))} />
      </TableCell>
      <TableCell>
        <Select
          value={local.source}
          onValueChange={(v) => setLocal((d) => ({ ...d, source: v as LeadItem["source"] }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["WhatsApp", "Ads", "Fiverr"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input value={local.service} onChange={(e) => setLocal((d) => ({ ...d, service: e.target.value }))} />
      </TableCell>
      <TableCell>
        <Select
          value={local.status}
          onValueChange={(v) => setLocal((d) => ({ ...d, status: v as LeadItem["status"] }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["New", "Contacted", "Closed"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          inputMode="numeric"
          value={local.value}
          onChange={(e) => setLocal((d) => ({ ...d, value: Number(e.target.value || 0) }))}
        />
      </TableCell>
      <TableCell>
        <Input
          type="date"
          value={local.date || ""}
          onChange={(e) => setLocal((d) => ({ ...d, date: e.target.value }))}
        />
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!changed}
          onClick={() =>
            onUpdate(
              (it) => it.id === row.id,
              () => ({ ...local, value: Number(local.value) || 0 }),
            )
          }
        >
          Save
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onRemove((it) => it.id === row.id)}>
          Delete
        </Button>
      </TableCell>
    </TableRow>
  )
}
