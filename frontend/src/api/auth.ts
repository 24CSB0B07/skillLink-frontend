// src/api/auth.ts
// Unchanged, as it's backend-related and functional
import { api } from './axios'

export interface AuthResponse {
  token: string
  user: { id: string; role: 'client' | 'freelancer' }
}

export const login = async (email: string, password: string) => {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export const signup = async (
  email: string,
  password: string,
  role: 'client' | 'freelancer'
) => {
  const { data } = await api.post<AuthResponse>('/auth/signup', { email, password, role })
  return data
}