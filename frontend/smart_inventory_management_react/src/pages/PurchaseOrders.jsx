// src/pages/PurchaseOrders.jsx
import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { getPurchaseOrders, createPurchaseOrder, getSuppliers, getWarehouses, getProducts } from '../api/inventory'
import { Card, Table, Button, Modal, FormField, Select, Input, PageHeader, Alert, Badge } from '../components/ui'
import { formatCurrency, formatDate } from '../utils/format'

export default function PurchaseOrders() {
  const { data: orders, loading, refetch } = useFetch(getPurchaseOrders)
  const { data: suppliers } = useFetch(getSuppliers)
  const { data: warehouses } = useFetch(getWarehouses)
  const { data: products } = useFetch(getProducts)

  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ supplierId: '', warehouseId: '', items: [{ productId: '', quantity: '' }] })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: ''}] })
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })
  const updateItem = (i, key, val) => {
    const items = [...form.items]
    items[i] = { ...items[i], [key]: val }
    setForm({ ...form, items })
  }

  const handleSave = async () => {
    setError(''); setSaving(true)
    try {
      await createPurchaseOrder({
        supplierId: Number(form.supplierId),
        warehouseId: Number(form.warehouseId),
items: form.items.map(it => {
  const product = products.find(p => p.id === Number(it.productId))

  return {
    productId: Number(it.productId),
    quantity: Number(it.quantity),
    price: product?.purchasePrice || 0
  }
})      })
      setModal(false)
      setForm({ supplierId: '', warehouseId: '', items: [{ productId: '', quantity: '' }] })
      refetch()
    } catch (e) { setError(e.response?.data || 'Failed') }
    finally { setSaving(false) }
  }

  const columns = [
    { key: 'id', label: 'PO #', render: (r) => <strong>PO-{r.id}</strong> },
    { key: 'orderDate', label: 'Date', render: (r) => formatDate(r.orderDate) },
    { key: 'supplierName', label: 'Supplier' },
    { key: 'warehouseName', label: 'Warehouse' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'grandTotal', label: 'Total', render: (r) => <strong>{formatCurrency(r.grandTotal)}</strong> },
    { key: 'items', label: 'Items', render: (r) => <Badge variant="info">{r.items?.length} items</Badge> },
  ]

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        sub="Stock received from suppliers"
        action={<Button onClick={() => { setError(''); setModal(true) }}>+ New Purchase Order</Button>}
      />
      <Card style={{ padding: 0 }}>
        {loading
          ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div>
          : <Table columns={columns} data={orders || []} />
        }
      </Card>

      {modal && (
        <Modal title="New Purchase Order" onClose={() => setModal(false)} width={600}>
          {error && <Alert>{error}</Alert>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Supplier">
              <Select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">Select supplier…</option>
                {(suppliers || []).map(s => <option key={s.id} value={s.id}>{s.supplierName}</option>)}
              </Select>
            </FormField>
            <FormField label="Receive into Warehouse">
              <Select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
                <option value="">Select warehouse…</option>
                {(warehouses || []).map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
              </Select>
            </FormField>
          </div>

          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, marginTop: 4 }}>Items</div>
          {form.items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <div>
                {i === 0 && <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Product</div>}
                <Select value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)}>
                  <option value="">Select…</option>
                  {(products || []).map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                </Select>
              </div>
              <div>
                {i === 0 && <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Qty</div>}
                <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} placeholder="0" />
              </div>
{/* <div>
  {i === 0 && (
    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
      Unit Price ₹
    </div>
  )}

  <Input
    value={
      products.find(p => p.id === Number(item.productId))?.purchasePrice || ''
    }
    disabled
    placeholder="Auto"
  />
</div> */}
              <Button size="sm" variant="ghost" onClick={() => removeItem(i)} style={{ marginTop: i === 0 ? 20 : 0 }}>✕</Button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addItem}>+ Add Item</Button>
          <div style={{ padding: '10px 0', marginTop: 8, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-3)' }}>
            Purchasing prices are taken automatically from each product's current purchase Price.
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Create Purchase Order'}</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}