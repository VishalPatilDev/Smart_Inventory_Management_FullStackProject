// src/utils/format.js

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    .format(amount || 0)

export const formatNumber = (n) =>
  new Intl.NumberFormat('en-IN').format(n || 0)

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  // Backend sends LocalDateTime with NO timezone info (e.g. "2026-06-30T09:00:00").
  // new Date() on a string like this can be misinterpreted across browsers —
  // some treat it as UTC and shift it, causing the "4 hours off" bug.
  // Since the backend server and the data are both meant to represent IST wall-clock
  // time as-is, we parse the components manually instead of trusting Date() to guess.
  const [datePart, timePart] = dateStr.split('T')
  if (!datePart || !timePart) return '—'

  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)

  const date = new Date(year, month - 1, day, hour, minute)
  return date.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

// Today and month start for report date pickers
export const today = () => new Date().toISOString().split('T')[0]
export const monthStart = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}