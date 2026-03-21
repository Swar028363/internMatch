import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/auth'

export interface User {
  id: number
  email: string
  role: 'applicant' | 'recruiter'
}

interface AuthContextType {
  user: User | null
  token: string | null
  // Step 1 - sends OTP, returns nothing (throws on error)
  sendRegisterOtp: (email: string, password: string, role: 'applicant' | 'recruiter') => Promise<void>
  // Step 2 - verifies OTP, creates account, logs in
  verifyRegisterOtp: (email: string, otp: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    if (!storedToken) return
    setToken(storedToken)
    authService.getMe()
      .then((me) => setUser({ id: me.id, email: me.email, role: me.role }))
      .catch(() => {
        localStorage.removeItem('authToken')
        setToken(null)
        setUser(null)
      })
  }, [])

  const _storeSession = (accessToken: string, userData: User) => {
    localStorage.setItem('authToken', accessToken)
    setToken(accessToken)
    setUser(userData)
  }

  const sendRegisterOtp = async (
    email: string,
    password: string,
    role: 'applicant' | 'recruiter',
  ) => {
    // Just sends the OTP - throws ApiError on failure
    await authService.register({ email, password, role })
  }

  const verifyRegisterOtp = async (email: string, otp: string) => {
    const { access_token } = await authService.verifyOtp({ email, otp })
    localStorage.setItem('authToken', access_token)
    const me = await authService.getMe()
    _storeSession(access_token, { id: me.id, email: me.email, role: me.role })
  }

  const login = async (email: string, password: string) => {
    const { access_token } = await authService.login({ email, password })
    localStorage.setItem('authToken', access_token)
    const me = await authService.getMe()
    _storeSession(access_token, { id: me.id, email: me.email, role: me.role })
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, token,
      sendRegisterOtp, verifyRegisterOtp,
      login, logout,
      isAuthenticated: !!token && !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}