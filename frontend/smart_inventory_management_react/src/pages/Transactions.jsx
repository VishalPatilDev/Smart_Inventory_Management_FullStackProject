// src/pages/Transactions.jsx
import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { getTransactions } from '../api/inventory'
import { Card, Table, Badge, PageHeader, Select, Input, Button } from '../components/ui'
import { formatDateTime } from '../utils/format'

const TYPE_VARIANTS = {
  PURCHASE:     'success',
  SALE:         'info',
  RETURN:       'warning',
  DAMAGE:       'danger',
  TRANSFER_IN:  'success',
  TRANSFER_OUT: 'warning',
  ADJUSTMENT:   'default',
}

const TYPE_ICONS = {
  PURCHASE: '⬆️', SALE: '⬇️', RETURN: '↩️',
  DAMAGE: '💥', TRANSFER_IN: '➡️', TRANSFER_OUT: '⬅️', ADJUSTMENT: '🔧',
}

export default function Transactions() {
  const [filters, setFilters] = useState({ type: '', productId: '', warehouseId: '' })
  const [applied, setApplied] = useState({})

  // Fetch with optional query params — refetch when applied changes
  const { data: transactions, loading, refetch } = useFetch(
    () => getTransactions(
      Object.fromEntries(Object.entries(applied).filter(([_, v]) => v !== ''))
    ),
    [JSON.stringify(applied)]
  )

  const applyFilters = () => setApplied({ ...filters })
  const clearFilters = () => { setFilters({ type: '', productId: '', warehouseId: '' }); setApplied({}) }

  const hasFilters = Object.values(applied).some(v => v !== '' && v !== undefined)

  const columns = [
    {
      key: 'transactionDate', label: 'Date & Time',
      render: (r) => <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{formatDateTime(r.transactionDate)}</span>
    },
    {
      key: 'transactionType', label: 'Type',
      render: (r) => (
        <Badge variant={TYPE_VARIANTS[r.transactionType] || 'default'}>
          {TYPE_ICONS[r.transactionType]} {r.transactionType}
        </Badge>
      )
    },
    { key: 'productName', label: 'Product' },
    {
      key: 'sku', label: 'SKU',
      render: (r) => (
        <code style={{ fontSize: 11, background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>
          {r.sku}
        </code>
      )
    },
    { key: 'warehouseName', label: 'Warehouse' },
    {
      key: 'quantity', label: 'Quantity',
      render: (r) => {
        const isOut = ['SALE', 'TRANSFER_OUT', 'DAMAGE'].includes(r.transactionType)
        return (
          <span style={{ fontWeight: 700, color: isOut ? 'var(--danger)' : 'var(--success)' }}>
            {isOut ? '−' : '+'}{r.quantity}
          </span>
        )
      }
    },
    {
      key: 'performedBy', label: 'Performed By',
      render: (r) => (
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{r.performedBy}</span>
      )
    },
  ]

  const TRANSACTION_TYPES = ['PURCHASE', 'SALE', 'RETURN', 'DAMAGE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT']

  return (
    <div>
      <PageHeader
        title="Stock Transactions"
        sub="Complete audit trail of every stock movement"
      />

      {/* Filter bar */}
      <Card style={{ marginBottom: 16, padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, fontWeight: 500 }}>
              TRANSACTION TYPE
            </div>
            <Select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              style={{ width: 200 }}
            >
              <option value="">All types</option>
              {TRANSACTION_TYPES.map(t => (
                <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>
              ))}
            </Select>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, fontWeight: 500 }}>
              PRODUCT ID
            </div>
            <Input
              type="number"
              placeholder="e.g. 1"
              value={filters.productId}
              onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
              style={{ width: 120 }}
            />
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, fontWeight: 500 }}>
              WAREHOUSE ID
            </div>
            <Input
              type="number"
              placeholder="e.g. 1"
              value={filters.warehouseId}
              onChange={(e) => setFilters({ ...filters, warehouseId: e.target.value })}
              style={{ width: 120 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={applyFilters}>Apply</Button>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>Clear</Button>
            )}
          </div>

          {(transactions || []).length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 'auto', alignSelf: 'center' }}>
              {(transactions || []).length} records
            </span>
          )}
        </div>
      </Card>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {TRANSACTION_TYPES.map(t => (
          <Badge key={t} variant={TYPE_VARIANTS[t]}>
            {TYPE_ICONS[t]} {t}
          </Badge>
        ))}
      </div>

      <Card style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading transactions…</div>
        ) : (transactions || []).length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔄</div>
            <div style={{ fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>No transactions found</div>
            <div style={{ fontSize: 13 }}>
              {hasFilters ? 'Try adjusting your filters' : 'Create a purchase order to see stock movements here'}
            </div>
          </div>
        ) : (
          <Table columns={columns} data={transactions || []} />
        )}
      </Card>
    </div>
  )
}