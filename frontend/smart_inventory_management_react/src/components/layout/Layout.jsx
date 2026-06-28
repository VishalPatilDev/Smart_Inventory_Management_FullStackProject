// src/components/layout/Layout.jsx
// The main app shell: sidebar on the left, content on the right.
// Every page is wrapped in this component (except login).

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/',            label: 'Dashboard',     icon: '📊' },
  { to: '/products',    label: 'Products',      icon: '📦' },
  { to: '/categories',  label: 'Categories',    icon: '🏷️' },
  { to: '/suppliers',   label: 'Suppliers',     icon: '🏭' },
  { to: '/warehouses',  label: 'Warehouses',    icon: '🏪' },
  { to: '/inventory',   label: 'Inventory',     icon: '📋' },
  { to: '/purchases',   label: 'Purchase Orders', icon: '🛒' },
  { to: '/sales',       label: 'Sales Orders',  icon: '💰' },
  { to: '/transactions',label: 'Transactions',  icon: '🔄' },
  { to: '/reports',     label: 'Reports',       icon: '📈' },
  { to: '/users',       label: 'Users',         icon: '👥', adminOnly: true },
]

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>
            📦 SmartInventory
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            Management System
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {navItems.filter(item => !item.adminOnly || isAdmin()).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px', fontSize: 13, fontWeight: 500,
                color: isActive ? 'var(--primary)' : 'var(--text-2)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                borderRight: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                textDecoration: 'none', transition: 'all 0.1s',
                cursor: 'pointer'
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 2 }}>Logged in as</div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '7px', fontSize: 13,
              border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              background: 'none', color: 'var(--text-2)', cursor: 'pointer'
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}