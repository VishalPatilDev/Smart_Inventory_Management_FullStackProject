// src/hooks/useCsvExport.js
// Pure JS CSV export — no backend call needed.
// Takes an array of objects and a column definition, builds a CSV string,
// and triggers a browser download.
//
// Usage:
//   const { exportCsv } = useCsvExport()
//
//   exportCsv({
//     filename: 'products-2024-06-30',
//     columns: [
//       { header: 'Product Name', key: 'productName' },
//       { header: 'SKU',          key: 'sku' },
//       { header: 'Sell Price',   key: 'sellingPrice', format: (v) => `₹${v}` },
//     ],
//     data: products  // array of objects
//   })

export function useCsvExport() {

  const exportCsv = ({ filename, columns, data }) => {
    if (!data || data.length === 0) {
      alert('No data to export')
      return
    }

    // Build header row
    const headers = columns.map(col => `"${col.header}"`).join(',')

    // Build data rows — escape any quotes inside cell values
    const rows = data.map(row =>
      columns.map(col => {
        const rawValue = row[col.key]
        const value = col.format ? col.format(rawValue) : (rawValue ?? '')
        // Wrap in quotes and escape internal quotes by doubling them
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(',')
    )

    const csv = [headers, ...rows].join('\n')

    // Create a Blob and trigger download
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    // \uFEFF = UTF-8 BOM — makes Excel open ₹ and other Unicode correctly
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return { exportCsv }
}