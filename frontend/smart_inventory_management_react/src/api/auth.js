// src/api/auth.js
import api from './axios'

export const login = (email, password) =>
  api.post('/inventory_welcome/login', { email, password })

export const register = (data) =>
  api.post('/inventory_welcome/register', data)

export const healthCheck = () =>
  api.get('/inventory_welcome/health')