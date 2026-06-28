// src/pages/Products.jsx
import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, getSuppliers } from '../api/inventory'
import {
  Card, Table, Button, Modal, FormField, Input, Select,
  Badge, PageHeader, LoadingPage, Alert, EmptyState
} from '../components/ui'
import { formatCurrency } from '../utils/format'

const EMPTY_FORM = { productName: '', sku: '', purchasePrice: '', sellingPrice: '', categoryId: '', supplierId: '' }

export default function Products() {
  const { data: products, loading, refetch } = useFetch(getProducts)
  const { data: categories } = useFetch(getCategories)
  const { data: suppliers } = useFetch(getSuppliers)

  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setError(''); setModal('create') }
  const openEdit = (p) => {
    setForm({
      productName: p.productName, sku: p.sku,
      purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice,
      categoryId: '', supplierId: ''  // these aren't in response — user must reselect
    })
    setEditId(p.id); setError(''); setModal('edit')
  }

  const handleSave = async () => {
    setError(''); setSaving(true)
    try {
      const payload = {
        ...form,
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        categoryId: Number(form.categoryId),
        supplierId: Number(form.supplierId)
      }
      if (modal === 'create') await createProduct(payload)
      else await updateProduct(editId, payload)
      setModal(null)
      refetch()
    } catch (err) {
      const data = err.response?.data
      setError(typeof data === 'object' ? Object.values(data).join(', ') : data || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try { await deleteProduct(id); refetch() }
    catch (e) { alert(e.response?.data || 'Cannot delete') }
  }

  // Client-side filter
  const filtered = (products || []).filter(p => {
    const matchSearch = !search ||
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCategory || p.categoryName === filterCategory
    return matchSearch && matchCat
  })

  const uniqueCategories = [...new Set((products || []).map(p => p.categoryName))]

  const columns = [
    { key: 'productName', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'categoryName', label: 'Category', render: (r) => <Badge variant="info">{r.categoryName}</Badge> },
    { key: 'supplierName', label: 'Supplier' },
    { key: 'purchasePrice', label: 'Buy Price', render: (r) => formatCurrency(r.purchasePrice) },
    { key: 'sellingPrice', label: 'Sell Price', render: (r) => formatCurrency(r.sellingPrice) },
    {
      key: 'margin', label: 'Margin',
      render: (r) => {
        const margin = ((r.sellingPrice - r.purchasePrice) / r.sellingPrice * 100).toFixed(1)
        return <Badge variant={margin > 20 ? 'success' : 'warning'}>{margin}%</Badge>
      }
    },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Delete</Button>
        </div>
      )
    }
  ]

  if (loading) return <LoadingPage />

  return (
    <div>
      <PageHeader
        title="Products"
        sub={`${filtered.length} products`}
        action={<Button onClick={openCreate}>+ Add Product</Button>}
      />

      {/* Filters */}
      <Card style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 280 }}
          />
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ maxWidth: 200 }}
          >
            <option value="">All categories</option>
            {uniqueCategories.map(c => <option key={c}>{c}</option>)}
          </Select>
          {(search || filterCategory) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterCategory('') }}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        {filtered.length === 0
          ? <EmptyState title="No products found" sub="Add your first product to get started" action={<Button onClick={openCreate}>+ Add Product</Button>} />
          : <Table columns={columns} data={filtered} />
        }
      </Card>

      {/* Create / Edit modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'Add Product' : 'Edit Product'} onClose={() => setModal(null)}>
          {error && <Alert>{error}</Alert>}
          <FormField label="Product Name">
            <Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} placeholder="Dell Laptop" />
          </FormField>
          <FormField label="SKU">
            <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="DELL-LAP-001" />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Purchase Price (₹)">
              <Input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} placeholder="45000" />
            </FormField>
            <FormField label="Selling Price (₹)">
              <Input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} placeholder="58000" />
            </FormField>
          </div>
          <FormField label="Category">
            <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Select category…</option>
              {(categories || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Supplier">
            <Select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">Select supplier…</option>
              {(suppliers || []).map(s => <option key={s.id} value={s.id}>{s.supplierName}</option>)}
            </Select>
          </FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}