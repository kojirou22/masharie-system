'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type DateRangeFilterProps = {
  from: string
  to: string
}

type Preset = {
  label: string
  getRange: () => { from: string; to: string }
}

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateLabel(value: string) {
  if (!value) return ''

  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1)
}

function getLabel(from: string, to: string) {
  if (!from && !to) return 'All time'
  if (from && to && from === to) return formatDateLabel(from)
  if (from && to) return `${formatDateLabel(from)} – ${formatDateLabel(to)}`
  if (from) return `From ${formatDateLabel(from)}`
  return `Until ${formatDateLabel(to)}`
}

export function DateRangeFilter({ from, to }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState(from)
  const [draftTo, setDraftTo] = useState(to)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const presets = useMemo<Preset[]>(() => {
    const today = new Date()
    const todayInput = toInputDate(today)

    return [
      {
        label: 'Today',
        getRange: () => ({ from: todayInput, to: todayInput }),
      },
      {
        label: 'This month',
        getRange: () => ({ from: toInputDate(startOfMonth(today)), to: todayInput }),
      },
      {
        label: 'This year',
        getRange: () => ({ from: toInputDate(startOfYear(today)), to: todayInput }),
      },
      {
        label: 'Last 7 days',
        getRange: () => ({ from: toInputDate(addDays(today, -6)), to: todayInput }),
      },
      {
        label: 'Last 30 days',
        getRange: () => ({ from: toInputDate(addDays(today, -29)), to: todayInput }),
      },
      {
        label: 'Clear',
        getRange: () => ({ from: '', to: '' }),
      },
    ]
  }, [])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
        setDraftFrom(from)
        setDraftTo(to)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setDraftFrom(from)
        setDraftTo(to)
      }
    }

    if (isOpen) {
      document.addEventListener('pointerdown', handlePointerDown)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [from, isOpen, to])

  const label = getLabel(from, to)
  const hasInvalidRange = Boolean(draftFrom && draftTo && draftFrom > draftTo)

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name="date_from" value={hasInvalidRange ? from : draftFrom} />
      <input type="hidden" name="date_to" value={hasInvalidRange ? to : draftTo} />
      <label
        htmlFor="period-filter"
        className="block text-xs font-medium text-blue-700 mb-1"
      >
        Period
      </label>
      <button
        id="period-filter"
        type="button"
        aria-expanded={isOpen}
        className="flex h-9 w-full min-w-56 items-center justify-between gap-3 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-left text-sm shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-64"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={from || to ? 'font-medium text-slate-900' : 'text-slate-500'}>
          {label}
        </span>
        <span className="text-slate-400" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[100] mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/70">
          <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="date-from-draft"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  Date From
                </label>
                <input
                  id="date-from-draft"
                  type="date"
                  value={draftFrom}
                  max={draftTo || undefined}
                  data-no-auto-submit
                  aria-describedby={hasInvalidRange ? 'date-range-error' : undefined}
                  aria-invalid={hasInvalidRange}
                  className={`h-10 w-full rounded-lg border bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 ${hasInvalidRange ? 'border-rose-300 focus:ring-rose-500' : 'border-blue-200 focus:ring-blue-500'}`}
                  onChange={(event) => setDraftFrom(event.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="date-to-draft"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  Date To
                </label>
                <input
                  id="date-to-draft"
                  type="date"
                  value={draftTo}
                  min={draftFrom || undefined}
                  data-no-auto-submit
                  aria-describedby={hasInvalidRange ? 'date-range-error' : undefined}
                  aria-invalid={hasInvalidRange}
                  className={`h-10 w-full rounded-lg border bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 ${hasInvalidRange ? 'border-rose-300 focus:ring-rose-500' : 'border-blue-200 focus:ring-blue-500'}`}
                  onChange={(event) => setDraftTo(event.target.value)}
                />
              </div>
              {hasInvalidRange ? (
                <p id="date-range-error" className="text-xs font-medium leading-relaxed text-rose-600">
                  Date From must be the same as or earlier than Date To.
                </p>
              ) : (
                <p className="text-xs leading-relaxed text-slate-500">
                  Use the same date in both fields for one day only.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  data-no-auto-submit
                  className="rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    const range = preset.getRange()
                    setDraftFrom(range.from)
                    setDraftTo(range.to)
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              data-no-auto-submit
              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => {
                setDraftFrom(from)
                setDraftTo(to)
                setIsOpen(false)
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasInvalidRange}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
