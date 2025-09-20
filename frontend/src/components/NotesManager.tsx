'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  user: {
    email: string
  }
}

// Add proper type definitions for tenant and user
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

// Define the AuthContext type
interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  logout: () => void
}

const NotesManager: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [error, setError] = useState<string>('')
  const [isNotesLoading, setIsNotesLoading] = useState<boolean>(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  const { user, token, isLoading, logout } = useAuth() as AuthContextType

  useEffect(() => {
    if (token) {
      fetchNotes()
    }
  }, [token])

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'API request failed')
    }
    
    return response.json()
  }

  const fetchNotes = async (): Promise<void> => {
    try {
      setIsNotesLoading(true)
      const fetchedNotes = await apiCall('/api/notes')
      setNotes(fetchedNotes)
      setError('')
    } catch (err) {
      setError('Failed to load notes')
      console.error('Error fetching notes:', err)
    } finally {
      setIsNotesLoading(false)
    }
  }

  const createNote = async (): Promise<void> => {
    try {
      const newNote = await apiCall('/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Note',
          content: 'Start writing your note here...'
        })
      })
      
      setNotes(prev => [newNote, ...prev])
      setSelectedNote(newNote)
      setError('')
    } catch (err: any) {
      if (err.message.includes('Note limit reached')) {
        setShowUpgradeModal(true)
      } else {
        setError('Failed to create note')
      }
    }
  }

  const updateNote = async (id: string, updates: { title?: string; content?: string }): Promise<void> => {
    try {
      const updatedNote = await apiCall(`/api/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      
      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note))
      if (selectedNote?.id === id) {
        setSelectedNote(updatedNote)
      }
    } catch (err) {
      setError('Failed to update note')
    }
  }

  const deleteNote = async (id: string): Promise<void> => {
    try {
      await apiCall(`/api/notes/${id}`, { method: 'DELETE' })
      setNotes(prev => prev.filter(note => note.id !== id))
      if (selectedNote?.id === id) {
        setSelectedNote(null)
      }
    } catch (err) {
      setError('Failed to delete note')
    }
  }

  const upgradeTenant = async (): Promise<void> => {
    try {
      if (!user?.tenant.slug) return
      
      await apiCall(`/api/tenants/${user.tenant.slug}/upgrade`, {
        method: 'POST'
      })
      
      setShowUpgradeModal(false)
      // Refresh user info to get updated plan
      window.location.reload()
    } catch (err) {
      setError('Failed to upgrade tenant')
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newTitle = e.target.value
    if (selectedNote) {
      updateNote(selectedNote.id, { title: newTitle })
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newContent = e.target.value
    if (selectedNote) {
      updateNote(selectedNote.id, { content: newContent })
    }
  }

  if (isLoading || (isNotesLoading && notes.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading notes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
              <p className="text-sm text-gray-600">
                {user?.tenant.name} - {user?.tenant.plan.toUpperCase()} Plan
                {user?.tenant.plan === 'free' && (
                  <span className="ml-2">({notes.length}/{user.tenant.noteLimit} notes used)</span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <button
                  onClick={createNote}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  New Note
                </button>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                    <button
                      onClick={() => setError('')}
                      className="float-right text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200">
                {notes.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No notes yet. Create your first note!
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                          selectedNote?.id === note.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                        }`}
                        onClick={() => setSelectedNote(note)}
                      >
                        <h3 className="font-medium text-gray-900 truncate">
                          {note.title || 'Untitled'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {note.content.substring(0, 100)}...
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <small className="text-xs text-gray-500">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </small>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm('Are you sure you want to delete this note?')) {
                                deleteNote(note.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow h-full">
              {selectedNote ? (
                <div className="p-6 h-full flex flex-col">
                  <input
                    type="text"
                    value={selectedNote.title}
                    onChange={handleTitleChange}
                    className="text-2xl font-bold border-none outline-none mb-4 w-full"
                    placeholder="Note title..."
                  />
                  <textarea
                    value={selectedNote.content}
                    onChange={handleContentChange}
                    className="flex-1 border-none outline-none resize-none w-full"
                    placeholder="Start writing your note..."
                  />
                  <div className="mt-4 text-sm text-gray-500">
                    Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a note to edit or create a new one
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Note Limit Reached
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              You've reached your limit of {user?.tenant.noteLimit} notes on the Free plan. 
              Upgrade to Pro for unlimited notes.
            </p>
            <div className="flex space-x-3">
              {user?.role === 'admin' ? (
                <button
                  onClick={upgradeTenant}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Upgrade to Pro
                </button>
              ) : (
                <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-center">
                  Contact your admin to upgrade
                </div>
              )}
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesManager