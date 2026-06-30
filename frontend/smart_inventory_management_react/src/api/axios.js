// src/api/axios.js
// Central axios instance. Every API call goes through here.
// The request interceptor automatically attaches the JWT token
// so we never have to think about it in individual components.

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',  //'/api' proxied to localhost:8080 by Vite
  headers: { 'Content-Type': 'application/json' }
})

// REQUEST interceptor — attach token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// RESPONSE interceptor — if 403, token expired, send to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 = invalid/expired token → force logout
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    // 403 = valid token, just not authorized for this action → let it pass through
    // so the component's catch block can show "Access Denied" inline
    return Promise.reject(error)
  }
)

export default api