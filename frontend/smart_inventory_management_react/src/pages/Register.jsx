// src/pages/Register.jsx
// First-time setup page. Anyone can register before any users exist.
// After the first ADMIN is created, you may want to restrict this
// endpoint on the backend to ADMIN-only (or keep it open for demo).

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth'
import { Card, Button, Input, FormField, Alert } from '../components/ui'

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '', role: 'STAFF' }

export default function Register() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  // Client-side validation before hitting the backend
  const validate = () => {
    const e = {}
    if (!form.name.trim())            e.name = 'Name is required'
    if (!form.email.trim())           e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password)               e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.role)                   e.role = 'Select a role'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      })
      setSuccess(true)
      // After 2 seconds redirect to login
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object') {
        // Spring validation errors come as { field: message }
        setErrors(data)
      } else {
        setServerError(data || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value })
    // Clear field error as user types
    if (errors[key]) setErrors({ ...errors, [key]: '' })
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)'
      }}>
        <Card style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Account created!</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
            Redirecting you to the login page…
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 16
    }}>
      <Card style={{ width: '100%', maxWidth: 420 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Create an account</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>
            SmartInventory Management System
          </p>
        </div>

        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>

          {/* Full name */}
          <FormField label="Full Name" error={errors.name}>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="Rahul Sharma"
              style={{
                width: '100%', padding: '8px 12px',
                border: `1px solid ${errors.name ? 'var(--danger)' : 'var(--border-strong)'}`,
                borderRadius: 'var(--radius)', fontSize: 14,
                outline: 'none', background: 'var(--surface)', color: 'var(--text)'
              }}
            />
          </FormField>

          {/* Email */}
          <FormField label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="rahul@company.com"
              style={{
                width: '100%', padding: '8px 12px',
                border: `1px solid ${errors.email ? 'var(--danger)' : 'var(--border-strong)'}`,
                borderRadius: 'var(--radius)', fontSize: 14,
                outline: 'none', background: 'var(--surface)', color: 'var(--text)'
              }}
            />
          </FormField>

          {/* Password */}
          <FormField label="Password" error={errors.password}>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Min. 6 characters"
              style={{
                width: '100%', padding: '8px 12px',
                border: `1px solid ${errors.password ? 'var(--danger)' : 'var(--border-strong)'}`,
                borderRadius: 'var(--radius)', fontSize: 14,
                outline: 'none', background: 'var(--surface)', color: 'var(--text)'
              }}
            />
          </FormField>

          {/* Confirm password */}
          <FormField label="Confirm Password" error={errors.confirmPassword}>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              placeholder="Re-enter password"
              style={{
                width: '100%', padding: '8px 12px',
                border: `1px solid ${errors.confirmPassword ? 'var(--danger)' : 'var(--border-strong)'}`,
                borderRadius: 'var(--radius)', fontSize: 14,
                outline: 'none', background: 'var(--surface)', color: 'var(--text)'
              }}
            />
          </FormField>

          {/* Role selector */}
          <FormField label="Role" error={errors.role}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
              {[
                { value: 'ADMIN', label: 'Admin', desc: 'Full access — create, edit, delete', icon: '🛡️' },
                { value: 'STAFF', label: 'Staff', desc: 'Read-only — view data only', icon: '👤' },
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => { setForm({ ...form, role: option.value }); if (errors.role) setErrors({ ...errors, role: '' }) }}
                  style={{
                    border: `2px solid ${form.role === option.value ? 'var(--primary)' : 'var(--border-strong)'}`,
                    borderRadius: 'var(--radius)',
                    padding: '12px',
                    cursor: 'pointer',
                    background: form.role === option.value ? 'var(--primary-light)' : 'var(--surface)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{option.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: form.role === option.value ? 'var(--primary)' : 'var(--text)' }}>
                    {option.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    {option.desc}
                  </div>
                </div>
              ))}
            </div>
          </FormField>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        {/* Link to login */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-3)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}