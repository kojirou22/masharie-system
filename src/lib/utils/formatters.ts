import { format } from 'date-fns'

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

const ARABIC_SCRIPT_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/

export function hasArabicScript(value: string | null | undefined): boolean {
  return ARABIC_SCRIPT_REGEX.test(value ?? '')
}

export function arabicTextClass(value: string | null | undefined): string {
  return hasArabicScript(value) ? 'arabic-text' : ''
}
