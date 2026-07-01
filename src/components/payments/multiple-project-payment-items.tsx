'use client'

import { useMemo, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatPHP } from '@/lib/utils/currency'
import { arabicTextClass } from '@/lib/utils/formatters'

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
    [lines],
  )

  const totalAmount = useMemo(
    () => lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0),
    [lines],
  )

  function updateLine(id: string, updates: Partial<PaymentLine>) {
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
              Project allocations
            </h2>
            <Badge variant="outline">{lines.length} line{lines.length === 1 ? '' : 's'}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Add one row per project. Project and amount keep the repeated field names used by the server action.
          </p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card px-3 py-2 text-right shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">Batch total</div>
          <div className="font-mono text-lg font-semibold text-foreground">{formatPHP(totalAmount)}</div>
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

      <div className="mt-4 flex flex-col gap-2 border-t border-border/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={addLine} className="w-full sm:w-auto">
          + Add another project
        </Button>
        <p className="text-xs text-muted-foreground">
          Duplicate projects are filtered out before submission.
        </p>
      </div>
    </section>
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
      (project) => !selectedProjectIds.has(project.id) || project.id === line.projectId,
    )

    if (!normalizedQuery) {
      return availableProjects.slice(0, 15)
    }

    return availableProjects
      .filter((project) => {
        const searchable = [project.project_number, project.name, project.supervisor, project.address]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchable.includes(normalizedQuery)
      })
      .slice(0, 15)
  }, [line.projectId, line.query, projects, selectedProjectIds])

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-muted-foreground">
            Allocation {index + 1}
          </div>
          {selectedProject ? (
            <div className="mt-1 text-sm text-muted-foreground">
              Selected <span className="font-mono text-primary">{selectedProject.project_number}</span>
            </div>
          ) : null}
        </div>
        {canRemove && (
          <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
        <div>
          <input type="hidden" name="project_id" value={line.projectId} />
          <label htmlFor={`project-search-${line.id}`} className="mb-1.5 block text-sm font-medium text-foreground">
            Project <span className="text-destructive">*</span>
          </label>
          <Input
            id={`project-search-${line.id}`}
            type="search"
            value={line.query}
            onChange={(event) => onChange({ query: event.target.value, projectId: '' })}
            placeholder="Search project number, name, supervisor, or address..."
            autoComplete="off"
            className="h-10 rounded-xl bg-background"
          />

          {selectedProject ? (
            <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-mono text-xs font-medium text-primary">{selectedProject.project_number}</span>
                    <span className={cn('text-foreground', arabicTextClass(selectedProject.name))}>
                      {selectedProject.name}
                    </span>
                  </div>
                  {(selectedProject.supervisor || selectedProject.address) && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {[selectedProject.supervisor, selectedProject.address].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange({ projectId: '', query: '' })}
                  className="shrink-0"
                >
                  Change
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-border/80 bg-popover shadow-sm">
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
                    className="block w-full border-b border-border/60 px-3 py-2.5 text-left text-sm last:border-b-0 hover:bg-muted focus:bg-muted focus:outline-none"
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-mono text-xs font-medium text-primary">{project.project_number}</span>
                      <span className={cn('text-foreground', arabicTextClass(project.name))}>{project.name}</span>
                    </div>
                    {(project.supervisor || project.address) && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {[project.supervisor, project.address].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-sm text-muted-foreground">No matching projects found.</div>
              )}
            </div>
          )}
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
            placeholder="50000"
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
