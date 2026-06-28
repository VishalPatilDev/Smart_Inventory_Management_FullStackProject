// src/pages/Warehouses.jsx
import CrudPage from './CrudPage'
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from '../api/inventory'

const config = {
  title: 'Warehouses',

  fetchAll: getWarehouses,
  create:   createWarehouse,
  update:   updateWarehouse,
  remove:   deleteWarehouse,

  columns: [
    { key: 'id',            label: 'ID',      render: (r) => <span style={{ color: 'var(--text-3)', fontSize: 12 }}>#{r.id}</span> },
    { key: 'warehouseName', label: 'Name',    render: (r) => <strong>{r.warehouseName}</strong> },
    { key: 'address',       label: 'Address', render: (r) => <span style={{ color: 'var(--text-2)' }}>{r.address || '—'}</span> },
  ],

  formFields: [
    { key: 'warehouseName', label: 'Warehouse Name', placeholder: 'Mumbai Warehouse' },
    { key: 'address',       label: 'Address',         placeholder: 'Andheri East, Mumbai' },
  ],

  emptyForm: { warehouseName: '', address: '' }
}

export default function Warehouses() {
  return <CrudPage config={config} />
}