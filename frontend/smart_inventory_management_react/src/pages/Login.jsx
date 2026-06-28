// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, Button, Input, FormField, Alert } from '../components/ui'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 16
    }}>
      <Card style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>SmartInventory</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>
            Sign in to your account
          </p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <FormField label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@inventory.com"
              required
            />
          </FormField>
          <FormField label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </FormField>
          <Button
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-3)' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}
          >
            Create one
          </Link>
        </p>
      </Card>
    </div>
  )
}