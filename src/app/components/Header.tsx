'use client'

import { useState } from 'react'

interface HeaderProps {
  onLogout: () => void
}

export default function Header({ onLogout }: HeaderProps) {
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetPassword, setResetPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // בדוק שהסיסמה הנוכחית נכונה
    const currentPassword = localStorage.getItem('henDayanPassword')
    if (resetPassword === currentPassword) {
      // מחק את הסיסמה השמורה
      localStorage.removeItem('henDayanPassword')
      // מחק גם את סטטוס ההתחברות
      localStorage.removeItem('henDayanLoggedIn')
      setShowResetModal(false)
      // חזור לעמוד ההתחברות
      window.location.reload()
    } else {
      setError('סיסמה שגויה. נסה שוב.')
      setResetPassword('')
    }
    
    setIsLoading(false)
  }

  return (
    <>
      <header className="bg-white shadow-lg border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white bg-black px-4 py-2 rounded-lg">חן דיין</h1>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                אפס סיסמה
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
              >
                התנתקות
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal for password reset */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                אפס סיסמה
              </h2>
              <p className="text-sm text-gray-600">
                הזן את הסיסמה הנוכחית כדי לאפס את המערכת
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="resetPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  סיסמה נוכחית
                </label>
                <input
                  id="resetPassword"
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="הזן סיסמה נוכחית"
                  required
                  disabled={isLoading}
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
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isLoading}
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  disabled={isLoading || !resetPassword}
                >
                  {isLoading ? 'מאפס...' : 'אפס סיסמה'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
