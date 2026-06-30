// src/App.jsx
// Replace your existing file with this.
// Key change: the "/" route now renders a small RoleBasedHome component
// that picks Dashboard (admin) or StaffDashboard (staff) based on role.
// Purchase Orders, Sales Orders, Categories, Suppliers, Warehouses, Users
// are now wrapped in adminOnly ProtectedRoute — STAFF gets the "Access Denied"
// screen if they somehow type the URL directly, instead of a broken form.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
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

// Picks which dashboard to render based on the logged-in user's role.
// This is the single switch point — everything else stays the same.
function RoleBasedHome() {
  const { isAdmin } = useAuth()
  return isAdmin() ? <Dashboard /> : <StaffDashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected — wrapped in sidebar Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Home route — different component per role */}
            <Route index element={<RoleBasedHome />} />

            {/* Visible to both roles — read-only enforced inside each page */}
            <Route path="products"     element={<Products />} />
            <Route path="inventory"    element={<Inventory />} />
            <Route path="transactions" element={<Transactions />} />

            {/* ADMIN ONLY — STAFF gets Access Denied screen if they navigate here directly */}
            <Route path="categories" element={
              <ProtectedRoute adminOnly><Categories /></ProtectedRoute>
            } />
            <Route path="suppliers" element={
              <ProtectedRoute adminOnly><Suppliers /></ProtectedRoute>
            } />
            <Route path="warehouses" element={
              <ProtectedRoute adminOnly><Warehouses /></ProtectedRoute>
            } />
            <Route path="purchases" element={
              <ProtectedRoute adminOnly><PurchaseOrders /></ProtectedRoute>
            } />
            <Route path="sales" element={
              <ProtectedRoute adminOnly><SalesOrders /></ProtectedRoute>
            } />
            <Route path="reports" element={
              <ProtectedRoute adminOnly><Reports /></ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute adminOnly><Users /></ProtectedRoute>
            } />
          </Route>

          {/* Catch-all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}