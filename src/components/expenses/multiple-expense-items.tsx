'use client'

import { useMemo, useRef, useState } from 'react'

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
    [lines]
  )

  function updateLine(id: string, updates: Partial<ExpenseLine>) {
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, ...updates } : line))
    )
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((line) => line.id !== id))
  }

  return (
    <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">Expense purposes</h2>
          <p className="text-xs text-slate-500">
            Add one row per purpose. Date, check number, voucher, account, and status are shared.
          </p>
        </div>
        <div className="text-sm font-semibold text-blue-900">
          Total: {totalAmount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
        </div>
      </div>

      <div className="space-y-3">
        {lines.map((line, index) => (
          <div key={line.id} className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Purpose {index + 1}
              </div>
              {lines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_180px]">
              <div>
                <label htmlFor={`purpose-${line.id}`} className="block text-sm font-medium text-blue-700 mb-1">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  id={`purpose-${line.id}`}
                  name="purpose"
                  value={line.purpose}
                  onChange={(event) => updateLine(line.id, { purpose: event.target.value })}
                  placeholder="Office supplies"
                  required
                  className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor={`requested-by-${line.id}`} className="block text-sm font-medium text-blue-700 mb-1">
                  Requested By <span className="text-red-500">*</span>
                </label>
                <input
                  id={`requested-by-${line.id}`}
                  name="requested_by"
                  value={line.requestedBy}
                  onChange={(event) => updateLine(line.id, { requestedBy: event.target.value })}
                  placeholder="John Doe"
                  required
                  className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor={`amount-${line.id}`} className="block text-sm font-medium text-blue-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  id={`amount-${line.id}`}
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={line.amount}
                  onChange={(event) => updateLine(line.id, { amount: event.target.value })}
                  placeholder="10000"
                  required
                  className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          const lineId = `line-${nextLineNumber.current}`
          nextLineNumber.current += 1
          setLines((current) => [...current, createLine(lineId)])
        }}
        className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
      >
        + Add another purpose
      </button>
    </div>
  )
}
