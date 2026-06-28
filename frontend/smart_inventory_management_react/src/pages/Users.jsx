// src/pages/Users.jsx
import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { getUsers, deleteUser, updateUser } from '../api/inventory'
import { register } from '../api/auth'
import {
  Card, Table, Button, Modal, FormField, Input, Select,
  Badge, PageHeader, Alert, EmptyState
} from '../components/ui'

const EMPTY_FORM = { name: '', email: '', password: '', role: 'STAFF' }

export default function Users() {
  const { data: users, loading, refetch } = useFetch(getUsers)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setError(''); setModal('open') }
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setEditId(u.id); setError(''); setModal('open')
  }

  const handleSave = async () => {
    setError(''); setSaving(true)
    try {
      if (!editId) await register(form)
      else await updateUser(editId, form)
      setModal(null)
      refetch()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d === 'object' ? Object.values(d).join(', ') : d || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    try { await deleteUser(id); refetch() }
    catch (e) { alert(e.response?.data || 'Cannot delete user') }
  }

  const columns = [
    { key: 'id', label: 'ID', render: (r) => <span style={{ color: 'var(--text-3)', fontSize: 12 }}>#{r.id}</span> },
    { key: 'name', label: 'Name', render: (r) => <strong>{r.name}</strong> },
    { key: 'email', label: 'Email', render: (r) => <span style={{ color: 'var(--text-2)' }}>{r.email}</span> },
    {
      key: 'role', label: 'Role',
      render: (r) => (
        <Badge variant={r.role === 'ADMIN' ? 'danger' : 'info'}>{r.role}</Badge>
      )
    },
    {
      key: 'permissions', label: 'Permissions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Badge variant="default">READ</Badge>
          {r.role === 'ADMIN' && (
            <>
              <Badge variant="warning">WRITE</Badge>
              <Badge variant="danger">DELETE</Badge>
            </>
          )}
        </div>
      )
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

  return (
    <div>
      <PageHeader
        title="Users"
        sub={`${(users || []).length} users · ADMIN access only`}
        action={<Button onClick={openCreate}>+ Add User</Button>}
      />

      {/* Role explanation */}
      <Card style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
          <div>
            <Badge variant="danger">ADMIN</Badge>
            <span style={{ color: 'var(--text-2)', marginLeft: 8 }}>
              Full access — READ, WRITE, DELETE. Can manage users, create orders, run reports.
            </span>
          </div>
          <div>
            <Badge variant="info">STAFF</Badge>
            <span style={{ color: 'var(--text-2)', marginLeft: 8 }}>
              Read-only — can view products, inventory, and orders. Cannot create or delete.
            </span>
          </div>
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
        <Modal
          title={editId ? 'Edit User' : 'Add User'}
          onClose={() => setModal(null)}
        >
          {error && <Alert>{error}</Alert>}

          <FormField label="Full Name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Rahul Admin"
            />
          </FormField>

          <FormField label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="rahul@inventory.com"
            />
          </FormField>

          <FormField label={editId ? 'New Password (leave blank to keep current)' : 'Password'}>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </FormField>

          <FormField label="Role">
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="STAFF">STAFF — read only</option>
              <option value="ADMIN">ADMIN — full access</option>
            </Select>
          </FormField>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}