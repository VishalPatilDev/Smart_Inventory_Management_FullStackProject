// src/pages/Suppliers.jsx
import CrudPage from './CrudPage'
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../api/inventory'

const config = {
  title: 'Suppliers',

  fetchAll: getSuppliers,
  create:   createSupplier,
  update:   updateSupplier,
  remove:   deleteSupplier,

  columns: [
    { key: 'id',           label: 'ID',       render: (r) => <span style={{ color: 'var(--text-3)', fontSize: 12 }}>#{r.id}</span> },
    { key: 'supplierName', label: 'Name',      render: (r) => <strong>{r.supplierName}</strong> },
    { key: 'email',        label: 'Email',     render: (r) => <span style={{ color: 'var(--text-2)' }}>{r.email || '—'}</span> },
    { key: 'phone',        label: 'Phone',     render: (r) => <span style={{ color: 'var(--text-2)' }}>{r.phone || '—'}</span> },
  ],

  formFields: [
    { key: 'supplierName', label: 'Supplier Name', placeholder: 'Dell India' },
    { key: 'email',        label: 'Email',          placeholder: 'supply@dell.com', type: 'email' },
    { key: 'phone',        label: 'Phone',          placeholder: '9876543210' },
  ],

  emptyForm: { supplierName: '', email: '', phone: '' }
}

export default function Suppliers() {
  return <CrudPage config={config} />
}