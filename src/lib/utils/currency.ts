const formatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

export function formatPHP(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '—'
  return formatter.format(amount)
}
