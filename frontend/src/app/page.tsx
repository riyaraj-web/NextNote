'use client'

import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'
import NotesManager from '@/components/NotesManager'

export default function Home() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return user ? <NotesManager /> : <LoginForm />
}