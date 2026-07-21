// src/components/ui/Pagination.jsx
// Reusable pagination controls.
// Shows: Previous · 1 2 3 ... 12 · Next · "Showing 1–12 of 118"
//
// Usage:
//   <Pagination
//     page={page}           // current page (0-based from backend)
//     totalPages={12}
//     totalElements={118}
//     size={12}
//     onPageChange={setPage}
//   />

export function Pagination({ page, totalPages, totalElements, size, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null

  const from = page * size + 1
  const to   = Math.min((page + 1) * size, totalElements)

  // Build page number array with ellipsis
  // Always show: first, last, current, current±1
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const pages = new Set([0, totalPages - 1, page])
    if (page > 0) pages.add(page - 1)
    if (page < totalPages - 1) pages.add(page + 1)
    return Array.from(pages).sort((a, b) => a - b)
  }

  const pages = getPages()

  const btnStyle = (active, disabled) => ({
    padding: '6px 12px',
    fontSize: 13,
    border: '1px solid var(--border)',
    borderRadius: 6,
    background: active ? 'var(--primary)' : 'var(--surface)',
    color: active ? '#fff' : disabled ? 'var(--text-3)' : 'var(--text-2)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: active ? 600 : 400,
    minWidth: 36,
    textAlign: 'center',
    opacity: disabled ? 0.5 : 1,
    transition: 'background 0.1s, color 0.1s'
  })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', borderTop: '1px solid var(--border)',
      flexWrap: 'wrap', gap: 10
    }}>
      {/* Count label */}
      <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
        Showing <strong style={{ color: 'var(--text)' }}>{from}–{to}</strong> of{' '}
        <strong style={{ color: 'var(--text)' }}>{totalElements}</strong>
      </span>

      {/* Page buttons */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          style={btnStyle(false, page === 0)}
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          ← Prev
        </button>

        {pages.map((p, i) => {
          const prev = pages[i - 1]
          const showEllipsis = prev !== undefined && p - prev > 1
          return (
            <span key={p} style={{ display: 'flex', gap: 4 }}>
              {showEllipsis && (
                <span style={{ padding: '6px 4px', fontSize: 13, color: 'var(--text-3)' }}>…</span>
              )}
              <button
                style={btnStyle(p === page, false)}
                onClick={() => onPageChange(p)}
              >
                {p + 1}
              </button>
            </span>
          )
        })}

        <button
          style={btnStyle(false, page >= totalPages - 1)}
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  )
}