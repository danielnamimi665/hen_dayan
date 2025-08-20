'use client'

import { useState, useRef, useEffect } from 'react'

interface LoginModalProps {
  onClose: () => void
  onLoginSuccess: () => void
}

export default function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // בדיקה אם זו הפעם הראשונה או שיש כבר סיסמה שמורה
  useEffect(() => {
    const savedPassword = localStorage.getItem('henDayanPassword')
    if (!savedPassword) {
      setIsFirstTime(true)
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)

    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))

    if (isFirstTime) {
      // בפעם הראשונה - שמור את הסיסמה כסיסמה הקבועה
      if (password.length >= 4) {
        localStorage.setItem('henDayanPassword', password)
        onLoginSuccess()
      } else {
        setError('הסיסמה חייבת להיות לפחות 4 תווים')
        setPassword('')
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }
    } else {
      // בדוק מול הסיסמה השמורה
      const savedPassword = localStorage.getItem('henDayanPassword')
      if (password === savedPassword) {
        onLoginSuccess()
      } else {
        setError('סיסמה שגויה. נסה שוב.')
        setPassword('')
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }
    }
    
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto"
        role="dialog"
        aria-labelledby="login-title"
        aria-describedby="login-description"
      >
        <div className="text-center mb-6">
          <h2 id="login-title" className="text-xl font-bold text-gray-900 mb-2">
            {isFirstTime ? 'הגדרת סיסמה ראשונית' : 'כניסה למערכת'}
          </h2>
          <p id="login-description" className="text-sm text-gray-600">
            {isFirstTime 
              ? 'הזן סיסמה חדשה למערכת (לפחות 4 תווים)'
              : 'הזן סיסמה כדי להיכנס'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {isFirstTime ? 'סיסמה חדשה' : 'סיסמה'}
            </label>
            <input
              ref={inputRef}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={isFirstTime ? 'הזן סיסמה חדשה' : 'הזן סיסמה'}
              required
              disabled={isLoading}
              minLength={4}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading || !password || (isFirstTime && password.length < 4)}
            >
              {isLoading ? 'מתחבר...' : (isFirstTime ? 'שמירת סיסמה' : 'כניסה')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
