// @/contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Define the interfaces
interface Tenant {
  id: number
  slug: string
  name: string
  subscriptionPlan: string
  plan: string
  noteLimit: number
}

interface User {
  id: string
  email: string
  role: string
  tenant: Tenant
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      // You might want to validate the token and fetch user data here
      fetchUserData(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token')
        setToken(null)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}