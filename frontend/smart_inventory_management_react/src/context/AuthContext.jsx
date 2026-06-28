// src/context/AuthContext.jsx
// This is the global authentication state for the app.
// Any component can call useAuth() to get the user and login/logout functions.
// The token is stored in localStorage so it survives page refresh.

import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)  // true while we check localStorage

  // On mount, restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Spring Boot returns the JWT token as a plain string in the body
    const { data: jwtToken } = await loginApi(email, password)

    // Decode the JWT payload to extract user info (role, email)
    // JWT format: header.payload.signature — payload is base64 encoded
    const payload = JSON.parse(atob(jwtToken.split('.')[1]))

    // Build a simple user object from what we can read
    // Note: your backend puts email as the "subject"
    const userObj = {
      email: payload.sub,
      // Role comes from authorities if you add it to JWT claims
      // For now we store it after login via a profile fetch
      // or you can add it to the JWT claims in JWTUtil.generateToken()
    }

    localStorage.setItem('token', jwtToken)
    localStorage.setItem('user', JSON.stringify(userObj))
    setToken(jwtToken)
    setUser(userObj)
    return userObj
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  // Helper — check role from stored user
  // You should add role to your JWT claims for this to work fully.
  // In JWTUtil.generateToken(), add: .claim("role", user.getRole().name())
  const isAdmin = () => user?.role === 'ADMIN'
  const isStaff = () => user?.role === 'STAFF'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}