// src/components/ui/index.jsx
// All small reusable components in one file.
// Import what you need: import { Card, Badge, Button } from '../components/ui'

import React from 'react'

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', style }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      boxShadow: 'var(--shadow)',
      ...style
    }} className={className}>
      {children}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
// The big number cards at the top of Dashboard
export function StatCard({ label, value, sub, color = 'var(--primary)', icon }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        {icon && (
          <span style={{ fontSize: 20, color }}>
            {icon}
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>}
    </Card>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const badgeVariants = {
  success: { bg: 'var(--success-light)', color: 'var(--success)' },
  danger:  { bg: 'var(--danger-light)',  color: 'var(--danger)' },
  warning: { bg: 'var(--warning-light)', color: 'var(--warning)' },
  info:    { bg: 'var(--info-light)',    color: 'var(--info)' },
  default: { bg: 'var(--surface-2)',     color: 'var(--text-2)' },
}
export function Badge({ children, variant = 'default' }) {
  const s = badgeVariants[variant] || badgeVariants.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 100,
      fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.color
    }}>
      {children}
    </span>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', style }) {
  const styles = {
    primary: { background: 'var(--primary)', color: '#fff', border: 'none' },
    secondary: { background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' },
    danger:  { background: 'var(--danger)', color: '#fff', border: 'none' },
    ghost:   { background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)' },
  }
  const sizes = {
    sm: { padding: '4px 12px', fontSize: 12 },
    md: { padding: '8px 16px', fontSize: 14 },
    lg: { padding: '10px 20px', fontSize: 15 },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        borderRadius: 'var(--radius)', fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.15s',
        ...styles[variant], ...sizes[size], ...style
      }}
    >
      {children}
    </button>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid var(--border)`,
      borderTop: `2px solid var(--primary)`,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
  )
}

// ── LoadingPage ───────────────────────────────────────────────────────────────
export function LoadingPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
      <Spinner size={24} />
      <span style={{ color: 'var(--text-3)' }}>Loading…</span>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ title = 'No data', sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-3)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
      <div style={{ fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, marginBottom: 16 }}>{sub}</div>}
      {action}
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────
export function Table({ columns, data, onRowClick }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            {columns.map((col) => (
              <th key={col.key} style={{
                padding: '10px 12px', textAlign: 'left',
                fontWeight: 600, color: 'var(--text-3)',
                fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px',
                whiteSpace: 'nowrap'
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data || []).map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: '1px solid var(--border)',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '10px 12px', color: 'var(--text)' }}>
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose, width = 500 }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}
    >
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: width,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--border)'
        }}>
          <h3 style={{ fontWeight: 600, fontSize: 15 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 18,
            color: 'var(--text-3)', cursor: 'pointer', padding: 4
          }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

// ── FormField ─────────────────────────────────────────────────────────────────
export function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 13 }}>
        {label}
      </label>
      {children}
      {error && <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4, display: 'block' }}>{error}</span>}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ ...props }) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '8px 12px',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius)', fontSize: 14,
        background: 'var(--surface)', color: 'var(--text)',
        outline: 'none', transition: 'border-color 0.15s',
        ...props.style
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; props.onFocus?.(e) }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)'; props.onBlur?.(e) }}
    />
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: '100%', padding: '8px 12px',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius)', fontSize: 14,
        background: 'var(--surface)', color: 'var(--text)',
        outline: 'none', cursor: 'pointer',
        ...props.style
      }}
    >
      {children}
    </select>
  )
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ children, variant = 'danger' }) {
  const s = badgeVariants[variant] || badgeVariants.danger
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 'var(--radius)',
      background: s.bg, color: s.color,
      fontSize: 13, marginBottom: 16
    }}>
      {children}
    </div>
  )
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{title}</h1>
        {sub && <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}