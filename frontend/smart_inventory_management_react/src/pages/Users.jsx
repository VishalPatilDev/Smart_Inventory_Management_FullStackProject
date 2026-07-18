// src/pages/Users.jsx — updated with toast, confirm dialog, and field-level errors
import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { useFormHandler } from '../hooks/useFormHandler'
import { useConfirm } from '../components/ui/ConfirmDialog'
import { getUsers, deleteUser, updateUser } from '../api/inventory'
import { register } from '../api/auth'
import {
  Card, Table, Button, Modal, FormField, Input, Select,
  Badge, PageHeader, EmptyState
} from '../components/ui'

const EMPTY_FORM = { name: '', email: '', password: '', role: 'STAFF' }

export default function Users() {
  const { data: users, loading, refetch } = useFetch(getUsers)
  const { saving, fieldErrors, globalError, handle, handleDelete, clearErrors } = useFormHandler()
  const { confirm, ConfirmDialogUI } = useConfirm()

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); clearErrors(); setModal('open') }
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setEditId(u.id); clearErrors(); setModal('open')
  }

  const handleSave = () => handle(
    () => editId ? updateUser(editId, form) : register(form),
    editId ? 'User updated' : 'User created successfully',
    () => { setModal(null); refetch() }
  )

  const handleRemove = async (user) => {
    const yes = await confirm({
      title: 'Delete user?',
      message: `"${user.name}" will be permanently removed. If this user has created purchase orders or sales orders, deletion will fail — that data must be preserved.`,
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (!yes) return
    handleDelete(() => deleteUser(user.id), 'User', refetch)
  }

  const columns = [
    { key: 'id',    label: 'ID',   render: (r) => <span style={{ color: 'var(--text-3)', fontSize: 12 }}>#{r.id}</span> },
    { key: 'name',  label: 'Name', render: (r) => <strong>{r.name}</strong> },
    { key: 'email', label: 'Email', render: (r) => <span style={{ color: 'var(--text-2)' }}>{r.email}</span> },
    { key: 'role',  label: 'Role',  render: (r) => <Badge variant={r.role === 'ADMIN' ? 'danger' : 'info'}>{r.role}</Badge> },
    {
      key: 'permissions', label: 'Permissions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Badge variant="default">READ</Badge>
          {r.role === 'ADMIN' && <><Badge variant="warning">WRITE</Badge><Badge variant="danger">DELETE</Badge></>}
        </div>
      )
    },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => handleRemove(r)}>Delete</Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Users"
        sub={`${(users || []).length} users · ADMIN access only`}
        action={<Button onClick={openCreate}>+ Add User</Button>}
      />

      <Card style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
          <div><Badge variant="danger">ADMIN</Badge><span style={{ color: 'var(--text-2)', marginLeft: 8 }}>Full access — READ, WRITE, DELETE</span></div>
          <div><Badge variant="info">STAFF</Badge><span style={{ color: 'var(--text-2)', marginLeft: 8 }}>Read-only — view only</span></div>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div>
        ) : (users || []).length === 0 ? (
          <EmptyState title="No users found" action={<Button onClick={openCreate}>+ Add User</Button>} />
        ) : (
          <Table columns={columns} data={users || []} />
        )}
      </Card>

      {modal && (
        <Modal title={editId ? 'Edit User' : 'Add User'} onClose={() => setModal(null)}>
          {globalError && (
            <div style={{ padding: '10px 14px', marginBottom: 16, background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 8, fontSize: 13, border: '1px solid var(--danger)' }}>
              {globalError}
            </div>
          )}

          <FormField label="Full Name" error={fieldErrors.name} required>
            <Input value={form.name} error={fieldErrors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rahul Sharma" />
          </FormField>
          <FormField label="Email" error={fieldErrors.email} required>
            <Input type="email" value={form.email} error={fieldErrors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="rahul@inventory.com" />
          </FormField>
          <FormField label={editId ? 'New Password (leave blank to keep)' : 'Password'} error={fieldErrors.password} required={!editId}>
            <Input type="password" value={form.password} error={fieldErrors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </FormField>
          <FormField label="Role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="STAFF">STAFF — read only</option>
              <option value="ADMIN">ADMIN — full access</option>
            </Select>
          </FormField>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </Modal>
      )}

      {ConfirmDialogUI}
    </div>
  )
}