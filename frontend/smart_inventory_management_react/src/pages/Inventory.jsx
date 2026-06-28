// src/pages/Inventory.jsx
import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { getAllInventory, getWarehouses, transferStock, adjustStock } from '../api/inventory'
import { getProducts } from '../api/inventory'
import {
  Card, Table, Button, Modal, FormField, Select, Input,
  Badge, PageHeader, LoadingPage, Alert
} from '../components/ui'
import { formatNumber } from '../utils/format'

export default function Inventory() {
  const { data: inventory, loading, refetch } = useFetch(getAllInventory)
  const { data: warehouses } = useFetch(getWarehouses)
  const { data: products } = useFetch(getProducts)

  const [transferModal, setTransferModal] = useState(false)
  const [adjustModal, setAdjustModal] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filterWarehouse, setFilterWarehouse] = useState('')
  const [showLowOnly, setShowLowOnly] = useState(false)

  const filtered = (inventory || []).filter(row => {
    const matchWh = !filterWarehouse || row.warehouseName === filterWarehouse
    const matchLow = !showLowOnly || row.lowStock
    return matchWh && matchLow
  })

  const lowCount = (inventory || []).filter(r => r.lowStock).length

  const handleTransfer = async () => {
    setError(''); setSaving(true)
    try {
      await transferStock({
        productId: Number(form.productId),
        fromWarehouseId: Number(form.fromWarehouseId),
        toWarehouseId: Number(form.toWarehouseId),
        quantity: Number(form.quantity)
      })
      setTransferModal(false)
      setForm({})
      refetch()
    } catch (e) { setError(e.response?.data || 'Transfer failed') }
    finally { setSaving(false) }
  }

  const handleAdjust = async () => {
    setError(''); setSaving(true)
    try {
      await adjustStock({
        productId: Number(form.productId),
        warehouseId: Number(form.warehouseId),
        quantity: Number(form.quantity),
        transactionType: form.transactionType
      })
      setAdjustModal(false)
      setForm({})
      refetch()
    } catch (e) { setError(e.response?.data || 'Adjustment failed') }
    finally { setSaving(false) }
  }

  const columns = [
    { key: 'productName', label: 'Product' },
    { key: 'sku', label: 'SKU', render: (r) => <code style={{ fontSize: 11, background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>{r.sku}</code> },
    { key: 'warehouseName', label: 'Warehouse' },
    {
      key: 'quantity', label: 'Stock',
      render: (r) => (
        <span style={{ fontWeight: 700, color: r.quantity === 0 ? 'var(--danger)' : r.lowStock ? 'var(--warning)' : 'var(--success)' }}>
          {formatNumber(r.quantity)}
        </span>
      )
    },
    { key: 'reorderThreshold', label: 'Reorder At', render: (r) => formatNumber(r.reorderThreshold) },
    {
      key: 'status', label: 'Status',
      render: (r) => r.quantity === 0
        ? <Badge variant="danger">Out of stock</Badge>
        : r.lowStock ? <Badge variant="warning">Low stock</Badge>
        : <Badge variant="success">In stock</Badge>
    }
  ]

  if (loading) return <LoadingPage />

  const uniqueWarehouses = [...new Set((inventory || []).map(r => r.warehouseName))]

  return (
    <div>
      <PageHeader
        title="Inventory"
        sub={`${(inventory || []).length} inventory rows · ${lowCount} low stock alerts`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={() => { setForm({}); setError(''); setAdjustModal(true) }}>
              Adjust Stock
            </Button>
            <Button onClick={() => { setForm({}); setError(''); setTransferModal(true) }}>
              Transfer Stock
            </Button>
          </div>
        }
      />

      {lowCount > 0 && (
        <div style={{
          background: 'var(--warning-light)', border: '1px solid var(--warning)',
          borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16, fontSize: 13
        }}>
          ⚠️ <strong>{lowCount} items</strong> are at or below their reorder threshold.
          <button
            onClick={() => setShowLowOnly(!showLowOnly)}
            style={{ background: 'none', border: 'none', color: 'var(--warning)', fontWeight: 600, cursor: 'pointer', marginLeft: 8, textDecoration: 'underline' }}
          >
            {showLowOnly ? 'Show all' : 'Show only low stock'}
          </button>
        </div>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Select value={filterWarehouse} onChange={(e) => setFilterWarehouse(e.target.value)} style={{ maxWidth: 220 }}>
            <option value="">All warehouses</option>
            {uniqueWarehouses.map(w => <option key={w}>{w}</option>)}
          </Select>
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>
            Showing {filtered.length} rows
          </span>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        <Table columns={columns} data={filtered} />
      </Card>

      {/* Transfer modal */}
      {transferModal && (
        <Modal title="Transfer Stock Between Warehouses" onClose={() => setTransferModal(false)}>
          {error && <Alert>{error}</Alert>}
          <FormField label="Product">
            <Select value={form.productId || ''} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              <option value="">Select product…</option>
              {(products || []).map(p => <option key={p.id} value={p.id}>{p.productName} ({p.sku})</option>)}
            </Select>
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="From Warehouse">
              <Select value={form.fromWarehouseId || ''} onChange={(e) => setForm({ ...form, fromWarehouseId: e.target.value })}>
                <option value="">From…</option>
                {(warehouses || []).map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
              </Select>
            </FormField>
            <FormField label="To Warehouse">
              <Select value={form.toWarehouseId || ''} onChange={(e) => setForm({ ...form, toWarehouseId: e.target.value })}>
                <option value="">To…</option>
                {(warehouses || []).map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Quantity">
            <Input type="number" min="1" value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="10" />
          </FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setTransferModal(false)}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={saving}>{saving ? 'Transferring…' : 'Transfer'}</Button>
          </div>
        </Modal>
      )}

      {/* Adjust modal */}
      {adjustModal && (
        <Modal title="Adjust Stock" onClose={() => setAdjustModal(false)}>
          {error && <Alert>{error}</Alert>}
          <FormField label="Product">
            <Select value={form.productId || ''} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              <option value="">Select product…</option>
              {(products || []).map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
            </Select>
          </FormField>
          <FormField label="Warehouse">
            <Select value={form.warehouseId || ''} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
              <option value="">Select warehouse…</option>
              {(warehouses || []).map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
            </Select>
          </FormField>
          <FormField label="Adjustment Type">
            <Select value={form.transactionType || ''} onChange={(e) => setForm({ ...form, transactionType: e.target.value })}>
              <option value="">Select type…</option>
              <option value="DAMAGE">DAMAGE — remove damaged stock</option>
              <option value="RETURN">RETURN — customer returned item</option>
              <option value="ADJUSTMENT">ADJUSTMENT — manual correction</option>
            </Select>
          </FormField>
          <FormField label="Quantity">
            <Input type="number" min="1" value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setAdjustModal(false)}>Cancel</Button>
            <Button onClick={handleAdjust} disabled={saving}>{saving ? 'Saving…' : 'Save Adjustment'}</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}