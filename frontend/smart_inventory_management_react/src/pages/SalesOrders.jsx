// src/pages/SalesOrders.jsx — updated with toast notifications
import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { useFormHandler } from '../hooks/useFormHandler'
import { getSalesOrders, createSalesOrder, getWarehouses, getProducts } from '../api/inventory'
import { Card, Table, Button, Modal, FormField, Select, Input, PageHeader, Badge } from '../components/ui'
import { formatCurrency, formatDate } from '../utils/format'

export default function SalesOrders() {
  const { data: orders, loading, refetch } = useFetch(getSalesOrders)
  const { data: warehouses } = useFetch(getWarehouses)
  const { data: products } = useFetch(getProducts)
  const { saving, globalError, handle, clearErrors } = useFormHandler()

  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ warehouseId: '', items: [{ productId: '', quantity: '' }] })

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: '' }] })
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })
  const updateItem = (i, key, val) => {
    const items = [...form.items]; items[i] = { ...items[i], [key]: val }; setForm({ ...form, items })
  }

  const handleSave = () => handle(
    () => createSalesOrder({
      warehouseId: Number(form.warehouseId),
      items: form.items.map(it => ({ productId: Number(it.productId), quantity: Number(it.quantity) }))
    }),
    `Sales order created — stock dispatched successfully`,
    () => {
      setModal(false)
      setForm({ warehouseId: '', items: [{ productId: '', quantity: '' }] })
      refetch()
    }
  )

  const columns = [
    { key: 'id', label: 'SO #', render: (r) => <strong>SO-{r.id}</strong> },
    { key: 'orderDate', label: 'Date', render: (r) => formatDate(r.orderDate) },
    { key: 'warehouseName', label: 'Dispatched From' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'grandTotal', label: 'Total', render: (r) => <strong style={{ color: 'var(--success)' }}>{formatCurrency(r.grandTotal)}</strong> },
    { key: 'items', label: 'Items', render: (r) => <Badge variant="success">{r.items?.length} items</Badge> },
  ]

  return (
    <div>
      <PageHeader
        title="Sales Orders"
        sub="Stock dispatched to customers"
        action={<Button onClick={() => { clearErrors(); setModal(true) }}>+ New Sales Order</Button>}
      />
      <Card style={{ padding: 0 }}>
        {loading ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div>
          : <Table columns={columns} data={orders || []} />}
      </Card>

      {modal && (
        <Modal title="New Sales Order" onClose={() => setModal(false)} width={520}>
          {/* Insufficient stock error appears here prominently */}
          {globalError && (
            <div style={{ padding: '12px 14px', marginBottom: 16, background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 8, fontSize: 13, border: '1px solid var(--danger)', lineHeight: 1.5 }}>
              <strong>Cannot create order:</strong> {globalError}
            </div>
          )}

          <FormField label="Dispatch from Warehouse" required>
            <Select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
              <option value="">Select warehouse…</option>
              {(warehouses || []).map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
            </Select>
          </FormField>

          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Items</div>
          {form.items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <div>
                {i === 0 && <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Product</div>}
                <Select value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)}>
                  <option value="">Select…</option>
                  {(products || []).map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                </Select>
              </div>
              <div>
                {i === 0 && <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Quantity</div>}
                <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} placeholder="0" />
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeItem(i)} style={{ marginTop: i === 0 ? 20 : 0 }}>✕</Button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addItem}>+ Add Item</Button>

          <div style={{ padding: '10px 0', marginTop: 8, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-3)' }}>
            Selling prices are taken from each product's current price at the time of sale.
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Processing…' : 'Create Sales Order'}</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}