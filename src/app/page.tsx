'use client'

import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import MainPage from './components/MainPage'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const loginStatus = localStorage.getItem('henDayanLoggedIn')
    if (loginStatus === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
    localStorage.setItem('henDayanLoggedIn', 'true')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('henDayanLoggedIn')
  }

  return (
    <main className="min-h-screen">
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <MainPage onLogout={handleLogout} />
      )}
    </main>
  )
}
