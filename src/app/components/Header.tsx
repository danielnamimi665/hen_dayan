'use client'

import { useState, useEffect } from 'react'
import DatePill from './DatePill'

interface HeaderProps {
  onLogout: () => void
}

export default function Header({ onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-transparent shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Right side - Company name */}
          <div className="text-right">
            <h1 className="text-2xl font-bold text-black leading-tight">
              חן דיין
            </h1>
            <p className="text-sm text-black leading-tight">
              עבודות עפר ופיתוח
            </p>
          </div>

          {/* Left side - Date pill */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <DatePill />
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="יציאה מהמערכת"
            >
              יציאה
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
