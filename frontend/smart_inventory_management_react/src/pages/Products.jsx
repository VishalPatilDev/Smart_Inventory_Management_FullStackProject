// src/pages/Products.jsx — complete redesign with image support
// Shows products as a card grid (images prominent) by default.
// Toggle to table view for dense data scanning.
// Image uploader built into the create/edit modal.

import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import {
  getProducts, createProduct, updateProduct,
  deleteProduct, getCategories, getSuppliers
} from '../api/inventory'
import { useAuth } from '../context/AuthContext'
import {
  Card, Button, Modal, FormField, Input, Select,
  Badge, PageHeader, LoadingPage, Alert
} from '../components/ui'
import { ImageUploader } from '../components/ui/ImageUploader'
import { formatCurrency } from '../utils/format'

const EMPTY_FORM = {
  productName: '', sku: '', purchasePrice: '',
  sellingPrice: '', categoryId: '', supplierId: '', imageUrl: null
}

// Placeholder shown when a product has no image
function ProductImagePlaceholder({ name }) {
  const colors = ['#3b5bdb','#2f9e44','#e67700','#c92a2a','#7048e8','#1971c2']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{
      width: '100%', aspectRatio: '1/1',
      background: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 36, borderBottom: `1px solid ${color}22`
    }}>
      <span style={{ opacity: 0.6 }}>📦</span>
    </div>
  )
}

// Single product card — used in grid view
function ProductCard({ product, onEdit, onDelete, isAdmin }) {
  const margin = ((product.sellingPrice - product.purchasePrice) / product.sellingPrice * 100).toFixed(1)
  console.log(product.imageUrl);
  return (
    
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
      transition: 'transform 0.15s, box-shadow 0.15s',
      cursor: 'default'
    }}
    
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'

      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = 'var(--shadow)'
      }}
      
    >
      {/* Image area */}
      <div style={{ position: 'relative', background: 'var(--surface-2)' }}>
  {product.imageUrl ? (
    <img
      src={product.imageUrl}
      alt={product.productName}
      style={{
        width: '100%',
        aspectRatio: '1/1',
        objectFit: 'cover',
        display: 'block',
        borderBottom: '1px solid var(--border)'
      }}
      onError={(e) => {
        e.currentTarget.style.display = 'none'
        e.currentTarget.nextSibling.style.display = 'flex'
      }}
    />
  ) : null}

  <div style={{ 
    display: product.imageUrl ? 'none' : 'flex'
  }}>
    <ProductImagePlaceholder name={product.productName} />
  </div>

  {/* Category badge */}
  <div style={{ position: 'absolute', top: 8, left: 8 }}>
    <Badge variant="info">{product.categoryName}</Badge>
  </div>

  {/* Margin badge */}
  <div style={{ position: 'absolute', top: 8, right: 8 }}>
    <Badge variant={margin > 20 ? 'success' : 'warning'}>
      {margin}%
    </Badge>
  </div>
</div>

      {/* Info area */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: 'var(--text)' }}>
          {product.productName}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
          SKU: {product.sku} · {product.supplierName}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Buy</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(product.purchasePrice)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sell</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>
              {formatCurrency(product.sellingPrice)}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button size="sm" variant="ghost" onClick={() => onEdit(product)} style={{ flex: 1, justifyContent: 'center' }}>
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(product.id)} style={{ flex: 1, justifyContent: 'center' }}>
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Products() {
  const { isAdmin } = useAuth()
  const { data: products, loading, refetch } = useFetch(getProducts)
  const { data: categories } = useFetch(getCategories)
  const { data: suppliers } = useFetch(getSuppliers)

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [sortBy, setSortBy] = useState('name') // 'name' | 'price' | 'margin'

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setError(''); setModal('open') }
  const openEdit = (p) => {
    setForm({
      productName: p.productName, sku: p.sku,
      purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice,
      categoryId: p.categoryId, supplierId: p.supplierId, imageUrl: p.imageUrl || null
    })
    setEditId(p.id); setError(''); setModal('open')
  }

  const handleSave = async () => {
     console.log("handleSave called");
    setError(''); setSaving(true)
    try {
      const payload = {
        ...form,
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        categoryId: Number(form.categoryId),
        supplierId: Number(form.supplierId),
      }
      console.log("payload : ",payload)
      if (modal === 'open' && !editId){
        console.log("Creating...");
       await createProduct(payload)
      }
      else {
        console.log("Updating...");
        await updateProduct(editId, payload)
        console.log("Update successful");

      }
      setModal(null)
      refetch()
    } catch (err) {
     console.log("Error:", err);
    console.log("Response:", err.response);
    console.log("Response data:", err.response?.data);
    console.log(err.response?.data);
      const d = err.response?.data
      setError(typeof d === 'object' ? Object.values(d).join(', ') : d || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await deleteProduct(id); refetch() }
    catch (e) { alert(e.response?.data || 'Cannot delete') }
  }

  // Filter + sort
  const filtered = (products || [])
    .filter(p => {
      const matchSearch = !search ||
        p.productName.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCat = !filterCategory || p.categoryName === filterCategory
      return matchSearch && matchCat
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.productName.localeCompare(b.productName)
      if (sortBy === 'price') return b.sellingPrice - a.sellingPrice
      if (sortBy === 'margin') {
        const mA = (a.sellingPrice - a.purchasePrice) / a.sellingPrice
        const mB = (b.sellingPrice - b.purchasePrice) / b.sellingPrice
        return mB - mA
      }
      return 0
    })

  const uniqueCategories = [...new Set((products || []).map(p => p.categoryName))]

  if (loading) return <LoadingPage />

  return (
    <div>
      <PageHeader
        title="Products"
        sub={`${filtered.length} of ${(products || []).length} products`}
        action={isAdmin() && (
          <Button onClick={openCreate}>+ Add Product</Button>
        )}
      />

      {/* Toolbar */}
      <Card style={{ marginBottom: 20, padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Search name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 240 }}
          />
          <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="">All categories</option>
            {uniqueCategories.map(c => <option key={c}>{c}</option>)}
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ maxWidth: 160 }}>
            <option value="name">Sort: Name A–Z</option>
            <option value="price">Sort: Price high–low</option>
            <option value="margin">Sort: Margin high–low</option>
          </Select>
          {(search || filterCategory) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterCategory('') }}>Clear</Button>
          )}

          {/* View toggle */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {['grid', 'table'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '6px 12px', fontSize: 13, borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: viewMode === mode ? 'var(--primary)' : 'var(--surface)',
                  color: viewMode === mode ? '#fff' : 'var(--text-2)',
                  cursor: 'pointer', fontWeight: 500
                }}
              >
                {mode === 'grid' ? '⊞ Grid' : '☰ Table'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Grid view */}
      {viewMode === 'grid' && (
        filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div style={{ fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>No products found</div>
            {isAdmin() && <Button onClick={openCreate}>+ Add your first product</Button>}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16
          }}>
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={openEdit}
                onDelete={handleDelete}
                isAdmin={isAdmin()}
              />
            ))}
          </div>
        )
      )}

      {/* Table view */}
      {viewMode === 'table' && (
        <Card style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {['Image', 'Product', 'SKU', 'Category', 'Supplier', 'Buy Price', 'Sell Price', 'Margin', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 12px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                      textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const margin = ((p.sellingPrice - p.purchasePrice) / p.sellingPrice * 100).toFixed(1)
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '8px 12px' }}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.productName}
                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', display: 'block' }}
                          />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            📦
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{p.productName}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <code style={{ fontSize: 11, background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>{p.sku}</code>
                      </td>
                      <td style={{ padding: '8px 12px' }}><Badge variant="info">{p.categoryName}</Badge></td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{p.supplierName}</td>
                      <td style={{ padding: '8px 12px' }}>{formatCurrency(p.purchasePrice)}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(p.sellingPrice)}</td>
                      <td style={{ padding: '8px 12px' }}><Badge variant={margin > 20 ? 'success' : 'warning'}>{margin}%</Badge></td>
                      <td style={{ padding: '8px 12px' }}>
                        {isAdmin() && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>Edit</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>Delete</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create / Edit modal */}
      {modal && isAdmin() && (
        <Modal
          title={editId ? 'Edit Product' : 'Add Product'}
          onClose={() => setModal(null)}
          width={560}
        >
          {error && <Alert>{error}</Alert>}

          {/* Image uploader at the top */}
          <FormField label="Product Image">
            <ImageUploader
              value={form.imageUrl}
              onChange={(url) => {
    console.log("Uploaded URL:", url);
    setForm({ ...form, imageUrl: url });
}}
            />
          </FormField>

          <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

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

          {/* Live margin preview */}
          {form.purchasePrice && form.sellingPrice && (
            <div style={{
              padding: '8px 12px', borderRadius: 6, marginBottom: 16,
              background: 'var(--success-light)', fontSize: 12, color: 'var(--success)'
            }}>
              Margin: {((form.sellingPrice - form.purchasePrice) / form.sellingPrice * 100).toFixed(1)}%
              &nbsp;·&nbsp;Profit per unit: {formatCurrency(form.sellingPrice - form.purchasePrice)}
            </div>
          )}

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
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}