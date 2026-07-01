'use client'

import { useMemo, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPHP } from '@/lib/utils/currency'

type ExpenseLine = {
  id: string
  purpose: string
  requestedBy: string
  amount: string
}

function createLine(id: string): ExpenseLine {
  return { id, purpose: '', requestedBy: '', amount: '' }
}

export function MultipleExpenseItems() {
  const nextLineNumber = useRef(2)
  const [lines, setLines] = useState<ExpenseLine[]>([createLine('line-1')])

  const totalAmount = useMemo(
    () => lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0),
    [lines],
  )

  function updateLine(id: string, updates: Partial<ExpenseLine>) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...updates } : line)))
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((line) => line.id !== id))
  }

  function addLine() {
    const lineId = `line-${nextLineNumber.current}`
    nextLineNumber.current += 1
    setLines((current) => [...current, createLine(lineId)])
  }

  return (
    <section className="rounded-2xl border border-border/80 bg-background/60 p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Expense purposes
            </h2>
            <Badge variant="outline">{lines.length} line{lines.length === 1 ? '' : 's'}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Add one row per purpose. Purpose, requester, and amount keep the repeated field names used by the server action.
          </p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card px-3 py-2 text-right shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">Batch total</div>
          <div className="font-mono text-lg font-semibold text-foreground">{formatPHP(totalAmount)}</div>
        </div>
      </div>

      <div className="space-y-3">
        {lines.map((line, index) => (
          <ExpenseLineItem
            key={line.id}
            line={line}
            index={index}
            canRemove={lines.length > 1}
            onChange={(updates) => updateLine(line.id, updates)}
            onRemove={() => removeLine(line.id)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-border/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={addLine} className="w-full sm:w-auto">
          + Add another purpose
        </Button>
        <p className="text-xs text-muted-foreground">
          Each purpose becomes its own expense row under the shared release details.
        </p>
      </div>
    </section>
  )
}

function ExpenseLineItem({
  line,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  line: ExpenseLine
  index: number
  canRemove: boolean
  onChange: (updates: Partial<ExpenseLine>) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-muted-foreground">
            Purpose {index + 1}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {line.amount ? formatPHP(Number(line.amount) || 0) : 'No amount entered'}
          </div>
        </div>
        {canRemove && (
          <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_180px]">
        <div>
          <label htmlFor={`purpose-${line.id}`} className="mb-1.5 block text-sm font-medium text-foreground">
            Purpose <span className="text-destructive">*</span>
          </label>
          <Input
            id={`purpose-${line.id}`}
            name="purpose"
            value={line.purpose}
            onChange={(event) => onChange({ purpose: event.target.value })}
            placeholder="Office supplies"
            required
            className="h-10 rounded-xl bg-background"
          />
        </div>

        <div>
          <label htmlFor={`requested-by-${line.id}`} className="mb-1.5 block text-sm font-medium text-foreground">
            Requested By <span className="text-destructive">*</span>
          </label>
          <Input
            id={`requested-by-${line.id}`}
            name="requested_by"
            value={line.requestedBy}
            onChange={(event) => onChange({ requestedBy: event.target.value })}
            placeholder="Requester name"
            required
            className="h-10 rounded-xl bg-background"
          />
        </div>

        <div>
          <label htmlFor={`amount-${line.id}`} className="mb-1.5 block text-sm font-medium text-foreground">
            Amount <span className="text-destructive">*</span>
          </label>
          <Input
            id={`amount-${line.id}`}
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={line.amount}
            onChange={(event) => onChange({ amount: event.target.value })}
            placeholder="10000"
            required
            className="h-10 rounded-xl bg-background text-right font-mono"
          />
          <div className="mt-1 text-right text-xs text-muted-foreground">
            {line.amount ? formatPHP(Number(line.amount) || 0) : 'Enter amount'}
          </div>
        </div>
      </div>
    </div>
  )
}
