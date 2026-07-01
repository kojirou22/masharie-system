import { cn } from '@/lib/utils'
import { arabicTextClass } from '@/lib/utils/formatters'

type FieldProps = {
  arabicAware?: boolean
  className?: string
  defaultValue?: string | number | null
  label: string
  name: string
  placeholder?: string
  required?: boolean
  type?: string
}

export function Field({
  arabicAware = false,
  className,
  defaultValue,
  label,
  name,
  placeholder,
  required = false,
  type = 'text',
}: FieldProps) {
  const value = defaultValue == null ? '' : String(defaultValue)

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={value}
        required={required}
        min={type === 'number' ? '0.01' : undefined}
        step={type === 'number' ? '0.01' : undefined}
        className={cn(
          'h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35',
          arabicAware && arabicTextClass(value),
          className,
        )}
      />
    </div>
  )
}

type SelectFieldProps = {
  defaultValue?: string
  label: string
  name: string
  options: readonly string[]
  required?: boolean
}

export function SelectField({
  defaultValue,
  label,
  name,
  options,
  required = false,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35"
      >
        <option value="" disabled={required}>
          Select...
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

type CheckboxFieldProps = {
  defaultChecked?: boolean
  label: string
  name: string
}

export function CheckboxField({ defaultChecked = false, label, name }: CheckboxFieldProps) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/80 bg-muted/35 px-3 py-2.5">
      <input
        id={name}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-input text-primary focus-visible:ring-3 focus-visible:ring-ring/35"
      />
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
    </div>
  )
}

type ProjectSelectProps = {
  defaultValue?: string | null
  projects: { id: string; project_number: string; name: string }[]
}

export function ProjectSelect({ defaultValue, projects }: ProjectSelectProps) {
  return (
    <div>
      <label htmlFor="project_id" className="mb-1.5 block text-sm font-medium text-foreground">
        Project <span className="text-destructive">*</span>
      </label>
      <select
        id="project_id"
        name="project_id"
        required
        defaultValue={defaultValue ?? ''}
        className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35"
      >
        <option value="" disabled>
          Select a project...
        </option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.project_number} — {project.name}
          </option>
        ))}
      </select>
    </div>
  )
}
