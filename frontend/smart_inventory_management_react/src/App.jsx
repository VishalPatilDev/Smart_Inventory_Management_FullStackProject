// src/App.jsx — add ToastProvider around AuthProvider
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Layout from './components/layout/Layout'

import Login          from './pages/Login'
import Register       from './pages/Register'
import Dashboard      from './pages/Dashboard'
import StaffDashboard from './pages/StaffDashboard'
import Products       from './pages/Products'
import Categories     from './pages/Categories'
import Suppliers      from './pages/Suppliers'
import Warehouses     from './pages/Warehouses'
import Inventory      from './pages/Inventory'
import PurchaseOrders from './pages/PurchaseOrders'
import SalesOrders    from './pages/SalesOrders'
import Transactions   from './pages/Transactions'
import Reports        from './pages/Reports'
import Users          from './pages/Users'

function RoleBasedHome() {
  const { isAdmin } = useAuth()
  return isAdmin() ? <Dashboard /> : <StaffDashboard />
}

export default function App() {
  return (
    // ToastProvider is outermost so toasts work everywhere including auth pages
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<RoleBasedHome />} />
              <Route path="products"     element={<Products />} />
              <Route path="inventory"    element={<Inventory />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="categories"  element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
              <Route path="suppliers"   element={<ProtectedRoute adminOnly><Suppliers /></ProtectedRoute>} />
              <Route path="warehouses"  element={<ProtectedRoute adminOnly><Warehouses /></ProtectedRoute>} />
              <Route path="purchases"   element={<ProtectedRoute adminOnly><PurchaseOrders /></ProtectedRoute>} />
              <Route path="sales"       element={<ProtectedRoute adminOnly><SalesOrders /></ProtectedRoute>} />
              <Route path="reports"     element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
              <Route path="users"       element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}