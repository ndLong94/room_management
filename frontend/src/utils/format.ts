/**
 * Format a number as locale string (e.g. for money display).
 */
export function formatMoney(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return Number.isNaN(n) ? '0' : n.toLocaleString()
}

/**
 * Format amount for display; returns '—' for NaN.
 */
export function formatAmount(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return Number.isNaN(n) ? '—' : n.toLocaleString()
}

/** Format ISO date (yyyy-MM-dd) to dd/MM/yyyy */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  if (!d || !m || !y) return isoDate
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
}

/** Format ISO date (yyyy-MM-dd) to "Ngày DD tháng MM YYYY" */
export function formatDateVietnamese(isoDate: string | null | undefined): string {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-').map(Number)
  if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return isoDate
  const monthNames = [
    '1', '2', '3', '4', '5', '6',
    '7', '8', '9', '10', '11', '12'
  ]
  return `Ngày ${d} tháng ${monthNames[m - 1]} ${y}`
}

/** True if today (date only) is >= dueDate (yyyy-MM-dd). */
export function isDueDateReached(dueDate: string | null | undefined): boolean {
  if (!dueDate) return true
  const [y, m, d] = dueDate.split('-').map(Number)
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return true
  const today = new Date()
  const due = new Date(y, m - 1, d)
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return today.getTime() >= due.getTime()
}
