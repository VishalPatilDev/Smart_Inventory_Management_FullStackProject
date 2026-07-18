// src/hooks/useFormHandler.js
// Eliminates the duplicated try/catch/setSaving/setError pattern
// that currently lives in every single page.
//
// Usage:
//   const { saving, fieldErrors, globalError, handle, clearErrors } = useFormHandler()
//
//   <Button onClick={() => handle(
//     () => createProduct(payload),           // the async API call
//     'Product created successfully!',         // success toast message
//     () => { setModal(null); refetch() }      // on-success callback
//   )}>Save</Button>

import { useState } from 'react'
import { useToast } from '../context/ToastContext'

export function useFormHandler() {
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})  // { fieldName: 'message' }
  const [globalError, setGlobalError] = useState('')  // non-field error string
  const { toast } = useToast()

  const clearErrors = () => {
    setFieldErrors({})
    setGlobalError('')
  }

  // Parses Spring Boot error responses into field-level or global errors
  const parseError = (err) => {
    const data = err.response?.data

    if (!data) {
      setGlobalError(err.message || 'Something went wrong')
      return
    }

    // Spring @Valid errors come as { fieldName: 'message', ... }
    if (typeof data === 'object' && !Array.isArray(data)) {
      setFieldErrors(data)
      // Also show a summary toast so the user doesn't miss it
      const count = Object.keys(data).length
      toast.error(`${count} field${count > 1 ? 's' : ''} need${count === 1 ? 's' : ''} attention`)
      return
    }

    // Plain string error (duplicate SKU, insufficient stock, etc.)
    const message = typeof data === 'string' ? data : 'Something went wrong'
    setGlobalError(message)
    toast.error(message, 5000)
  }

  const handle = async (apiFn, successMessage, onSuccess) => {
    clearErrors()
    setSaving(true)
    try {
      await apiFn()
      toast.success(successMessage)
      onSuccess?.()
    } catch (err) {
      parseError(err)
    } finally {
      setSaving(false)
    }
  }

  // For delete/non-form actions — shows confirm dialog first
  const handleDelete = async (apiFn, itemName, onSuccess) => {
    // We replace window.confirm with a toast-style approach:
    // just call the API directly since we have a proper error path now.
    // The caller is responsible for any pre-confirmation UI.
    setSaving(true)
    try {
      await apiFn()
      toast.success(`${itemName} deleted successfully`)
      onSuccess?.()
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'string' ? msg : `Cannot delete ${itemName}`)
    } finally {
      setSaving(false)
    }
  }

  return { saving, fieldErrors, globalError, handle, handleDelete, clearErrors }
}