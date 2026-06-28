// src/pages/CrudPage.jsx
// A reusable CRUD page — Categories, Suppliers, and Warehouses all follow
// the same pattern, so we build one component and configure it per domain.

import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { Card, Table, Button, Modal, FormField, Input, PageHeader, Alert, EmptyState } from '../components/ui'

export default function CrudPage({ config }) {
  const { title, fetchAll, create, update, remove, columns, formFields, emptyForm } = config

  const { data, loading, refetch } = useFetch(fetchAll)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openCreate = () => { setForm(emptyForm); setEditId(null); setError(''); setModal('open') }
  const openEdit = (row) => {
    const f = {}
    formFields.forEach(field => { f[field.key] = row[field.key] || '' })
    setForm(f); setEditId(row.id); setError(''); setModal('open')
  }

  const handleSave = async () => {
    setError(''); setSaving(true)
    try {
      if (!editId) await create(form)
      else await update(editId, form)
      setModal(null)
      refetch()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d === 'object' ? Object.values(d).join(', ') : d || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm(`Delete this ${title.slice(0, -1)}?`)) return
    try { await remove(id); refetch() }
    catch (e) { alert(e.response?.data || 'Cannot delete — it may have linked records') }
  }

  const tableColumns = [
    ...columns,
    {
      key: '_actions', label: '',
      render: (row) => (
        <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title={title}
        sub={`${(data || []).length} records`}
        action={<Button onClick={openCreate}>+ Add {title.slice(0, -1)}</Button>}
      />

      <Card style={{ padding: 0 }}>
        {loading
          ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div>
          : (data || []).length === 0
          ? <EmptyState title={`No ${title.toLowerCase()} yet`} action={<Button onClick={openCreate}>+ Add {title.slice(0, -1)}</Button>} />
          : <Table columns={tableColumns} data={data || []} />
        }
      </Card>

      {modal && (
        <Modal title={editId ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`} onClose={() => setModal(null)}>
          {error && <Alert>{error}</Alert>}
          {formFields.map(field => (
            <FormField key={field.key} label={field.label}>
              <Input
                type={field.type || 'text'}
                value={form[field.key] || ''}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder || ''}
              />
            </FormField>
          ))}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}