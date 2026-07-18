// src/pages/Products.jsx — with toast, confirm, field errors, margin preview
import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { useFormHandler } from '../hooks/useFormHandler'
import { useConfirm } from '../components/ui/ConfirmDialog'
import {
  getProducts, createProduct, updateProduct,
  deleteProduct, getCategories, getSuppliers
} from '../api/inventory'
import { useAuth } from '../context/AuthContext'
import {
  Card, Button, Modal, FormField, Input, Select,
  Badge, PageHeader, LoadingPage
} from '../components/ui'
import { formatCurrency } from '../utils/format'

const EMPTY_FORM = {
  productName: '', sku: '', purchasePrice: '',
  sellingPrice: '', categoryId: '', supplierId: '', imageUrl: null
}

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
      <span style={{ opacity: 0.5 }}>📦</span>
    </div>
  )
}

function ProductCard({ product, onEdit, onDelete, isAdmin }) {
  const [imgError, setImgError] = useState(false)
  const margin = ((product.sellingPrice - product.purchasePrice) / product.sellingPrice * 100).toFixed(1)
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)',
      transition: 'transform 0.15s, box-shadow 0.15s'
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
    >
      <div style={{ position: 'relative', background: 'var(--surface-2)' }}>
        {/* Show image OR placeholder — never both */}
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.productName}
            onError={() => setImgError(true)}
            style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block', borderBottom: '1px solid var(--border)' }}
          />
        ) : (
          <ProductImagePlaceholder name={product.productName} />
        )}
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <Badge variant="info">{product.categoryName}</Badge>
        </div>
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <Badge variant={margin > 20 ? 'success' : 'warning'}>{margin}%</Badge>
        </div>
      </div>

      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{product.productName}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
          {product.sku} · {product.supplierName}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Buy</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(product.purchasePrice)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sell</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(product.sellingPrice)}</div>
          </div>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button size="sm" variant="ghost" onClick={() => onEdit(product)} style={{ flex: 1, justifyContent: 'center' }}>Edit</Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(product)} style={{ flex: 1, justifyContent: 'center' }}>Delete</Button>
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
  const { saving, fieldErrors, globalError, handle, clearErrors } = useFormHandler()
  const { confirm, ConfirmDialogUI } = useConfirm()

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('name')

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); clearErrors(); setModal('open') }
  const openEdit = (p) => {
    setForm({ productName: p.productName, sku: p.sku, purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice, categoryId: '', supplierId: '', imageUrl: p.imageUrl || null })
    setEditId(p.id); clearErrors(); setModal('open')
  }

  const handleSave = () => handle(
    () => {
      const payload = { ...form, purchasePrice: Number(form.purchasePrice), sellingPrice: Number(form.sellingPrice), categoryId: Number(form.categoryId), supplierId: Number(form.supplierId) }
      return editId ? updateProduct(editId, payload) : createProduct(payload)
    },
    editId ? 'Product updated' : 'Product created',
    () => { setModal(null); refetch() }
  )

  const handleDelete = async (product) => {
    const yes = await confirm({
      title: 'Delete product?',
      message: `"${product.productName}" will be permanently deleted. All inventory records for this product will also be removed.`,
      confirmLabel: 'Delete product',
      variant: 'danger'
    })
    if (!yes) return
    handle(
      () => deleteProduct(product.id),
      `${product.productName} deleted`,
      refetch
    )
  }

  const filtered = (products || [])
    .filter(p => {
      const matchSearch = !search || p.productName.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCat = !filterCategory || p.categoryName === filterCategory
      return matchSearch && matchCat
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.productName.localeCompare(b.productName)
      if (sortBy === 'price') return b.sellingPrice - a.sellingPrice
      if (sortBy === 'margin') return ((b.sellingPrice - b.purchasePrice) / b.sellingPrice) - ((a.sellingPrice - a.purchasePrice) / a.sellingPrice)
      return 0
    })

  const uniqueCategories = [...new Set((products || []).map(p => p.categoryName))]
  const margin = form.purchasePrice && form.sellingPrice
    ? ((form.sellingPrice - form.purchasePrice) / form.sellingPrice * 100).toFixed(1)
    : null

  if (loading) return <LoadingPage />

  return (
    <div>
      <PageHeader
        title="Products"
        sub={`${filtered.length} of ${(products || []).length} products`}
        action={isAdmin() && <Button onClick={openCreate}>+ Add Product</Button>}
      />

      {/* Toolbar */}
      <Card style={{ marginBottom: 20, padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input placeholder="Search name or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
          <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="">All categories</option>
            {uniqueCategories.map(c => <option key={c}>{c}</option>)}
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="name">Sort: Name A–Z</option>
            <option value="price">Sort: Price high–low</option>
            <option value="margin">Sort: Margin high–low</option>
          </Select>
          {(search || filterCategory) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterCategory('') }}>Clear</Button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {['grid', 'table'].map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                padding: '6px 12px', fontSize: 13, borderRadius: 6,
                border: '1px solid var(--border)',
                background: viewMode === mode ? 'var(--primary)' : 'var(--surface)',
                color: viewMode === mode ? '#fff' : 'var(--text-2)',
                cursor: 'pointer', fontWeight: 500
              }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onEdit={openEdit} onDelete={handleDelete} isAdmin={isAdmin()} />
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
                  {['Image','Product','SKU','Category','Supplier','Buy','Sell','Margin', isAdmin() ? '' : null].filter(Boolean).map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const [imgError, setImgError] = useState(false)
                  const m = ((p.sellingPrice - p.purchasePrice) / p.sellingPrice * 100).toFixed(1)
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '8px 12px' }}>
                        {p.imageUrl && !imgError ? (
                          <img src={p.imageUrl} alt={p.productName} onError={() => setImgError(true)}
                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', display: 'block' }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>
                        )}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{p.productName}</td>
                      <td style={{ padding: '8px 12px' }}><code style={{ fontSize: 11, background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>{p.sku}</code></td>
                      <td style={{ padding: '8px 12px' }}><Badge variant="info">{p.categoryName}</Badge></td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{p.supplierName}</td>
                      <td style={{ padding: '8px 12px' }}>{formatCurrency(p.purchasePrice)}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(p.sellingPrice)}</td>
                      <td style={{ padding: '8px 12px' }}><Badge variant={m > 20 ? 'success' : 'warning'}>{m}%</Badge></td>
                      {isAdmin() && (
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>Edit</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(p)}>Delete</Button>
                          </div>
                        </td>
                      )}
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
        <Modal title={editId ? 'Edit Product' : 'Add Product'} onClose={() => setModal(null)} width={520}>
          {globalError && (
            <div style={{ padding: '10px 14px', marginBottom: 16, background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 8, fontSize: 13, border: '1px solid var(--danger)' }}>
              {globalError}
            </div>
          )}

          <FormField label="Product Name" error={fieldErrors.productName} required>
            <Input value={form.productName} error={fieldErrors.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} placeholder="Dell Laptop" />
          </FormField>
          <FormField label="SKU" error={fieldErrors.sku} required>
            <Input value={form.sku} error={fieldErrors.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="DELL-LAP-001" />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Purchase Price (₹)" error={fieldErrors.purchasePrice} required>
              <Input type="number" value={form.purchasePrice} error={fieldErrors.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} placeholder="45000" />
            </FormField>
            <FormField label="Selling Price (₹)" error={fieldErrors.sellingPrice} required>
              <Input type="number" value={form.sellingPrice} error={fieldErrors.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} placeholder="58000" />
            </FormField>
          </div>

          {/* Live margin preview */}
          {margin !== null && (
            <div style={{ padding: '8px 12px', borderRadius: 6, marginBottom: 16, background: 'var(--success-light)', fontSize: 12, color: 'var(--success)' }}>
              Margin: <strong>{margin}%</strong> · Profit per unit: <strong>{formatCurrency(form.sellingPrice - form.purchasePrice)}</strong>
            </div>
          )}

          <FormField label="Category" error={fieldErrors.categoryId} required>
            <Select value={form.categoryId} error={fieldErrors.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Select category…</option>
              {(categories || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Supplier" error={fieldErrors.supplierId} required>
            <Select value={form.supplierId} error={fieldErrors.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
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

      {ConfirmDialogUI}
    </div>
  )
}