// src/pages/CrudPage.jsx — updated with toast, confirm dialog, and field errors
import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { useFormHandler } from '../hooks/useFormHandler'
import { useConfirm } from '../components/ui/ConfirmDialog'
import { Card, Table, Button, Modal, FormField, Input, PageHeader, EmptyState } from '../components/ui'

export default function CrudPage({ config }) {
  const { title, fetchAll, create, update, remove, columns, formFields, emptyForm } = config
  const { data, loading, refetch } = useFetch(fetchAll)
  const { saving, fieldErrors, globalError, handle, handleDelete, clearErrors } = useFormHandler()
  const { confirm, ConfirmDialogUI } = useConfirm()

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  const openCreate = () => {
    setForm(emptyForm)
    setEditId(null)
    clearErrors()
    setModal('open')
  }

  const openEdit = (row) => {
    const f = {}
    formFields.forEach(field => { f[field.key] = row[field.key] || '' })
    setForm(f)
    setEditId(row.id)
    clearErrors()
    setModal('open')
  }

  const handleSave = () => handle(
    () => editId ? update(editId, form) : create(form),
    editId ? `${title.slice(0, -1)} updated` : `${title.slice(0, -1)} created`,
    () => { setModal(null); refetch() }
  )

  const handleRemove = async (row) => {
    const yes = await confirm({
      title: `Delete ${title.slice(0, -1)}?`,
      message: `"${row[formFields[0]?.key] || 'this item'}" will be permanently deleted. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (!yes) return
    handleDelete(() => remove(row.id), title.slice(0, -1), refetch)
  }

  const tableColumns = [
    ...columns,
    {
      key: '_actions', label: '',
      render: (row) => (
        <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => handleRemove(row)}>Delete</Button>
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

      {/* Create / Edit modal */}
      {modal && (
        <Modal
          title={editId ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
          onClose={() => setModal(null)}
        >
          {/* Global error (non-field) */}
          {globalError && (
            <div style={{
              padding: '10px 14px', marginBottom: 16,
              background: 'var(--danger-light)', color: 'var(--danger)',
              borderRadius: 8, fontSize: 13, border: '1px solid var(--danger)'
            }}>
              {globalError}
            </div>
          )}

          {formFields.map(field => (
            <FormField
              key={field.key}
              label={field.label}
              error={fieldErrors[field.key]}
              required={field.required}
            >
              <Input
                type={field.type || 'text'}
                value={form[field.key] || ''}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder || ''}
                error={fieldErrors[field.key]}
              />
            </FormField>
          ))}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Confirm delete dialog */}
      {ConfirmDialogUI}
    </div>
  )
}