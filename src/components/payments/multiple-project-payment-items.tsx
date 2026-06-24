'use client'

import { useMemo, useRef, useState } from 'react'

type ProjectOption = {
  id: string
  project_number: string
  name: string
  supervisor?: string | null
  address?: string | null
}

type PaymentLine = {
  id: string
  projectId: string
  query: string
  amount: string
}

interface MultipleProjectPaymentItemsProps {
  projects: ProjectOption[]
}

function createLine(id: string): PaymentLine {
  return {
    id,
    projectId: '',
    query: '',
    amount: '',
  }
}

export function MultipleProjectPaymentItems({ projects }: MultipleProjectPaymentItemsProps) {
  const nextLineNumber = useRef(2)
  const [lines, setLines] = useState<PaymentLine[]>([createLine('line-1')])

  const selectedProjectIds = useMemo(
    () => new Set(lines.map((line) => line.projectId).filter(Boolean)),
    [lines]
  )

  const totalAmount = useMemo(
    () => lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0),
    [lines]
  )

  function updateLine(id: string, updates: Partial<PaymentLine>) {
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
          <h2 className="text-sm font-semibold text-slate-950">Project allocations</h2>
          <p className="text-xs text-slate-500">
            Add one row per project. Check number, voucher, date, and notes are shared.
          </p>
        </div>
        <div className="text-sm font-semibold text-blue-900">
          Total: {totalAmount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
        </div>
      </div>

      <div className="space-y-3">
        {lines.map((line, index) => (
          <PaymentLineItem
            key={line.id}
            line={line}
            index={index}
            projects={projects}
            selectedProjectIds={selectedProjectIds}
            canRemove={lines.length > 1}
            onChange={(updates) => updateLine(line.id, updates)}
            onRemove={() => removeLine(line.id)}
          />
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
        + Add another project
      </button>
    </div>
  )
}

function PaymentLineItem({
  line,
  index,
  projects,
  selectedProjectIds,
  canRemove,
  onChange,
  onRemove,
}: {
  line: PaymentLine
  index: number
  projects: ProjectOption[]
  selectedProjectIds: Set<string>
  canRemove: boolean
  onChange: (updates: Partial<PaymentLine>) => void
  onRemove: () => void
}) {
  const selectedProject = projects.find((project) => project.id === line.projectId)

  const filteredProjects = useMemo(() => {
    const normalizedQuery = line.query.trim().toLowerCase()
    const availableProjects = projects.filter(
      (project) => !selectedProjectIds.has(project.id) || project.id === line.projectId
    )

    if (!normalizedQuery) {
      return availableProjects.slice(0, 15)
    }

    return availableProjects
      .filter((project) => {
        const searchable = [
          project.project_number,
          project.name,
          project.supervisor,
          project.address,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchable.includes(normalizedQuery)
      })
      .slice(0, 15)
  }, [line.projectId, line.query, projects, selectedProjectIds])

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Project {index + 1}
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
        <div>
          <input type="hidden" name="project_id" value={line.projectId} />
          <input
            type="search"
            value={line.query}
            onChange={(event) => onChange({ query: event.target.value, projectId: '' })}
            placeholder="Search project number, name, supervisor, or address..."
            className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />

          {selectedProject ? (
            <div className="mt-2 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
              <div>
                <div className="font-medium">{selectedProject.project_number} — {selectedProject.name}</div>
                {(selectedProject.supervisor || selectedProject.address) && (
                  <div className="mt-0.5 text-xs text-green-800">
                    {[selectedProject.supervisor, selectedProject.address].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onChange({ projectId: '', query: '' })}
                className="shrink-0 text-xs font-medium text-green-800 hover:text-green-950"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-blue-100 bg-white shadow-sm">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        projectId: project.id,
                        query: `${project.project_number} — ${project.name}`,
                      })
                    }
                    className="block w-full border-b border-blue-50 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  >
                    <div className="font-medium text-slate-950">{project.project_number} — {project.name}</div>
                    {(project.supervisor || project.address) && (
                      <div className="mt-0.5 text-xs text-slate-500">
                        {[project.supervisor, project.address].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-sm text-slate-500">No matching projects found.</div>
              )}
            </div>
          )}
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
            onChange={(event) => onChange({ amount: event.target.value })}
            placeholder="50000"
            required
            className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
