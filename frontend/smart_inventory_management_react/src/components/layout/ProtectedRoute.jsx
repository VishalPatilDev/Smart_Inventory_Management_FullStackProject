// src/components/layout/ProtectedRoute.jsx
// Wraps any route that requires the user to be logged in.
// If no token in localStorage → redirect to /login.
// If adminOnly=true and user is not ADMIN → show access denied.

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user, loading } = useAuth()

  // Still reading localStorage — don't flash the login page
  if (loading) return null

  // Not logged in → go to login
  if (!token) return <Navigate to="/login" replace />

  // Admin-only route but user is staff
  if (adminOnly && user?.role !== 'ADMIN') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 400, gap: 12, color: 'var(--text-3)'
      }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>Access Denied</div>
        <div style={{ fontSize: 13 }}>This page is restricted to ADMIN users only.</div>
      </div>
    )
  }

  return children
}