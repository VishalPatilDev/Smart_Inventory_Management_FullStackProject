// src/components/ui/ConfirmDialog.jsx
// Replaces the ugly browser window.confirm() popup.
// Shows a proper in-app modal with context-aware messaging.
//
// Usage:
//   const { confirm, ConfirmDialogUI } = useConfirm()
//
//   // In your component:
//   const handleDelete = async (id) => {
//     const yes = await confirm({
//       title: 'Delete product?',
//       message: 'This cannot be undone. All inventory records for this product will also be removed.',
//       confirmLabel: 'Delete',
//       variant: 'danger'
//     })
//     if (!yes) return
//     await deleteProduct(id)
//   }
//
//   // In your JSX:
//   {ConfirmDialogUI}

import { useState, useCallback } from 'react'
import { Button } from './index'

export function useConfirm() {
  const [state, setState] = useState(null) // null = hidden
  const [resolver, setResolver] = useState(null)

  const confirm = useCallback(({ title, message, confirmLabel = 'Confirm', variant = 'danger' }) => {
    return new Promise((resolve) => {
      setState({ title, message, confirmLabel, variant })
      // Store resolve so we can call it from the button handlers
      setResolver(() => resolve)
    })
  }, [])

  const handleYes = () => {
    resolver?.(true)
    setState(null)
    setResolver(null)
  }

  const handleNo = () => {
    resolver?.(false)
    setState(null)
    setResolver(null)
  }

  const ConfirmDialogUI = state ? (
    <div
      onClick={(e) => e.target === e.currentTarget && handleNo()}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}
    >
      <div style={{
        background: 'var(--surface)',
        borderRadius: 12,
        width: '100%', maxWidth: 400,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        overflow: 'hidden'
      }}>
        {/* Icon strip */}
        <div style={{
          padding: '20px 20px 0',
          display: 'flex', alignItems: 'flex-start', gap: 14
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
            background: state.variant === 'danger' ? 'var(--danger-light)' : 'var(--warning-light)',
            color: state.variant === 'danger' ? 'var(--danger)' : 'var(--warning)',
          }}>
            {state.variant === 'danger' ? '🗑️' : '⚠️'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
              {state.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
              {state.message}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '16px 20px'
        }}>
          <Button variant="ghost" onClick={handleNo}>
            Cancel
          </Button>
          <Button variant={state.variant} onClick={handleYes}>
            {state.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  ) : null

  return { confirm, ConfirmDialogUI }
}