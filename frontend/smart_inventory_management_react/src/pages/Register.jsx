// src/pages/Register.jsx — uses toast for success/error
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth'
import { useToast } from '../context/ToastContext'
import { Card, Button, Input, FormField } from '../components/ui'

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '', role: 'STAFF' }

export default function Register() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const validate = () => {
    const e = {}
    if (!form.name.trim())             e.name = 'Name is required'
    if (!form.email.trim())            e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password)                e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error(`${Object.keys(validationErrors).length} field(s) need attention`)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role })
      toast.success('Account created! Please sign in.')
      setTimeout(() => navigate('/login'), 1000)
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object') {
        setErrors(data)
        toast.error('Please fix the errors below')
      } else {
        toast.error(data || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value })
    if (errors[key]) setErrors({ ...errors, [key]: '' })
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 16
    }}>
      <Card style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Create an account</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>SmartInventory Management System</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Full Name" error={errors.name} required>
            <Input value={form.name} error={errors.name} onChange={set('name')} placeholder="Rahul Sharma" />
          </FormField>
          <FormField label="Email" error={errors.email} required>
            <Input type="email" value={form.email} error={errors.email} onChange={set('email')} placeholder="rahul@company.com" />
          </FormField>
          <FormField label="Password" error={errors.password} required>
            <Input type="password" value={form.password} error={errors.password} onChange={set('password')} placeholder="Min. 6 characters" />
          </FormField>
          <FormField label="Confirm Password" error={errors.confirmPassword} required>
            <Input type="password" value={form.confirmPassword} error={errors.confirmPassword} onChange={set('confirmPassword')} placeholder="Re-enter password" />
          </FormField>

          {/* Role selector */}
          <FormField label="Role" required>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
              {[
                { value: 'ADMIN', label: 'Admin', desc: 'Full access', icon: '🛡️' },
                { value: 'STAFF', label: 'Staff',  desc: 'Read-only',   icon: '👤' },
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => setForm({ ...form, role: option.value })}
                  style={{
                    border: `2px solid ${form.role === option.value ? 'var(--primary)' : 'var(--border-strong)'}`,
                    borderRadius: 'var(--radius)', padding: '12px', cursor: 'pointer',
                    background: form.role === option.value ? 'var(--primary-light)' : 'var(--surface)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{option.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: form.role === option.value ? 'var(--primary)' : 'var(--text)' }}>
                    {option.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{option.desc}</div>
                </div>
              ))}
            </div>
          </FormField>

          <Button type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}