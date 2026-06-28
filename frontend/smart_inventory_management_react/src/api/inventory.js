// src/api/inventory.js
// All API calls to your Spring Boot backend, organised by domain.

import api from './axios'

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories = () => api.get('/inventory_category')
export const getCategoryById = (id) => api.get(`/inventory_category/${id}`)
export const createCategory = (data) => api.post('/inventory_category', data)
export const updateCategory = (id, data) => api.put(`/inventory_category/${id}`, data)
export const deleteCategory = (id) => api.delete(`/inventory_category/${id}`)

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const getSuppliers = () => api.get('/inventory_supplier')
export const getSupplierById = (id) => api.get(`/inventory_supplier/${id}`)
export const createSupplier = (data) => api.post('/inventory_supplier', data)
export const updateSupplier = (id, data) => api.put(`/inventory_supplier/${id}`, data)
export const deleteSupplier = (id) => api.delete(`/inventory_supplier/${id}`)

// ── Warehouses ────────────────────────────────────────────────────────────────
export const getWarehouses = () => api.get('/inventory_warehouse')
export const getWarehouseById = (id) => api.get(`/inventory_warehouse/${id}`)
export const createWarehouse = (data) => api.post('/inventory_warehouse', data)
export const updateWarehouse = (id, data) => api.put(`/inventory_warehouse/${id}`, data)
export const deleteWarehouse = (id) => api.delete(`/inventory_warehouse/${id}`)

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = (params) => api.get('/inventory_product', { params })
export const getProductById = (id) => api.get(`/inventory_product/${id}`)
export const getProductBySku = (sku) => api.get(`/inventory_product/sku/${sku}`)
export const createProduct = (data) => api.post('/inventory_product', data)
export const updateProduct = (id, data) => api.put(`/inventory_product/${id}`, data)
export const deleteProduct = (id) => api.delete(`/inventory_product/${id}`)

// ── Inventory / Stock ─────────────────────────────────────────────────────────
export const getAllInventory = () => api.get('/inventory_stock')
export const getInventoryByProduct = (productId) => api.get(`/inventory_stock/product/${productId}`)
export const getInventoryByWarehouse = (warehouseId) => api.get(`/inventory_stock/warehouse/${warehouseId}`)
export const getLowStock = () => api.get('/inventory_stock/low-stock')

// ── Purchase Orders ───────────────────────────────────────────────────────────
export const getPurchaseOrders = () => api.get('/inventory_purchase')
export const getPurchaseOrderById = (id) => api.get(`/inventory_purchase/${id}`)
export const createPurchaseOrder = (data) => api.post('/inventory_purchase', data)

// ── Sales Orders ──────────────────────────────────────────────────────────────
export const getSalesOrders = () => api.get('/inventory_sales')
export const getSalesOrderById = (id) => api.get(`/inventory_sales/${id}`)
export const createSalesOrder = (data) => api.post('/inventory_sales', data)

// ── Stock Transactions ────────────────────────────────────────────────────────
export const getTransactions = (params) => api.get('/inventory_transactions', { params })
export const transferStock = (data) => api.post('/inventory_transactions/transfer', data)
export const adjustStock = (data) => api.post('/inventory_transactions/adjust', data)

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = () => api.get('/inventory_user/users')
export const getUserById = (id) => api.get(`/inventory_user/${id}`)
export const deleteUser = (id) => api.delete(`/inventory_user/delete/${id}`)
export const updateUser = (id, data) => api.put(`/inventory_user/update/${id}`, data)

// ── Reports ───────────────────────────────────────────────────────────────────
export const getDashboard = () => api.get('/reports/dashboard')
export const getInventoryValuation = () => api.get('/reports/inventory/valuation/warehouse')
export const getLowStockAlerts = () => api.get('/reports/inventory/low-stock')
export const getCriticalAlerts = () => api.get('/reports/inventory/low-stock/critical')
export const getSalesReport = (from, to) => api.get('/reports/sales', { params: { from, to } })
export const getSalesToday = () => api.get('/reports/sales/today')
export const getSalesMonth = () => api.get('/reports/sales/month')
export const getSalesYear = () => api.get('/reports/sales/year')
export const getTopSellers = (from, to, limit = 5) =>
  api.get('/reports/sales/top', { params: { from, to, limit } })
export const getPurchaseReport = (from, to) => api.get('/reports/purchases', { params: { from, to } })
export const getPurchaseMonth = () => api.get('/reports/purchases/month')