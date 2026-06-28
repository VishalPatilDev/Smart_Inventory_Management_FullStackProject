// src/App.jsx
// The router. Every page and its URL lives here.
// Layout wraps all protected pages (sidebar + main area).
// Login sits outside Layout — it has its own full-screen design.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Layout from './components/layout/Layout'

import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import Products      from './pages/Products'
import Categories    from './pages/Categories'
import Suppliers     from './pages/Suppliers'
import Warehouses    from './pages/Warehouses'
import Inventory     from './pages/Inventory'
import PurchaseOrders from './pages/PurchaseOrders'
import SalesOrders   from './pages/SalesOrders'
import Transactions  from './pages/Transactions'
import Reports       from './pages/Reports'
import Users         from './pages/Users'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected — all wrapped in sidebar Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* index = default child when at "/" */}
            <Route index element={<Dashboard />} />
            <Route path="products"     element={<Products />} />
            <Route path="categories"   element={<Categories />} />
            <Route path="suppliers"    element={<Suppliers />} />
            <Route path="warehouses"   element={<Warehouses />} />
            <Route path="inventory"    element={<Inventory />} />
            <Route path="purchases"    element={<PurchaseOrders />} />
            <Route path="sales"        element={<SalesOrders />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="reports"      element={<Reports />} />

            {/* Admin only */}
            <Route
              path="users"
              element={
                <ProtectedRoute adminOnly>
                  <Users />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}