// src/pages/Categories.jsx
// Uses the CrudPage factory — Categories is a simple name-only entity.
// All the modal / table / save logic lives in CrudPage.jsx.

import CrudPage from './CrudPage'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../api/inventory'

const config = {
  title: 'Categories',

  // API functions
  fetchAll: getCategories,
  create:   createCategory,
  update:   updateCategory,
  remove:   deleteCategory,

  // Table column definitions
  columns: [
    { key: 'id',   label: 'ID',   render: (r) => <span style={{ color: 'var(--text-3)', fontSize: 12 }}>#{r.id}</span> },
    { key: 'name', label: 'Category Name', render: (r) => <strong>{r.name}</strong> },
  ],

  // Form fields shown in the modal
  formFields: [
    { key: 'name', label: 'Category Name', placeholder: 'e.g. Electronics' }
  ],

  // Empty form state
  emptyForm: { name: '' }
}

export default function Categories() {
  return <CrudPage config={config} />
}