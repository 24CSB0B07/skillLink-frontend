// src/hooks/useAuth.ts
// No major changes needed, but added types for clarity
import { useEffect, useState } from 'react'
import { login as apiLogin, signup as apiSignup, type AuthResponse } from '@/api/auth'

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthResponse['user'] | null>(null)

  useEffect(() => {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (t) setToken(t)
    if (u) setUser(JSON.parse(u))
  }, [])

  const storeAuth = (data: AuthResponse) => {
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password)
    storeAuth(data)
    return data
  }

  const signup = async (email: string, password: string, role: 'client' | 'freelancer') => {
    const data = await apiSignup(email, password, role)
    storeAuth(data)
    return data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, login, signup, logout }
}