// src/pages/Login.jsx — uses toast for errors + loading state
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Card, Button, Input, FormField } from '../components/ui'
import { FcGoogle } from "react-icons/fc";
import { bgImage } from "../assets/inventory_managemnet.png"


export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data || 'Invalid email or password'
      toast.error(typeof msg === 'string' ? msg : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundImage:
        "linear-gradient(rgba(15,23,42,0.6), rgba(15,23,42,0.6)), `url(${bgImage})`",
      backgroundSize: "cover",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
      padding: "24px",
      overflow:"hidden"

    }}>
      <Card style={{
        width: "100%",
        maxWidth: 420,
        padding: "32px",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.25)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>SmartInventory</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>
            Sign in to your account
          </p>
        </div>

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
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "24px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: "#ddd",
            }}
          />
          <span
            style={{
              padding: "0 14px",
              color: "#777",
              fontSize: 13,
            }}
          >
            OR
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "#ddd",
            }}
          />
        </div>
        <button
          onClick={() => {
            window.location.href =
              "http://localhost:8080/oauth2/authorization/google";
          }}
          className="
    group
    flex items-center
    justify-center
    gap-3
    w-80
    h-12
    bg-white
    border border-gray-300
    rounded-xl
    text-gray-700
    font-semibold
    shadow-sm
    hover:shadow-lg
    hover:border-gray-400
    active:scale-95
    transition-all
    duration-200
  "
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white">
            <FcGoogle className="text-2xl" />
          </div>

          <span className="tracking-wide ">
            Continue with Google
          </span>
        </button>
        {/* <button
          onClick={() => {
            window.location.href =
              "http://localhost:8080/oauth2/authorization/github";
          }}
          className="flex items-center justify-center gap-3 px-6 py-3 w-full max-w-sm
             bg-black text-white rounded-lg
             hover:bg-gray-800 transition duration-200 shadow-md"
        >
          
          <span>Continue with GitHub</span>
        </button> */}
      </Card>
    </div>
  )
}