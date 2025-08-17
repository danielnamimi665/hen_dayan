'use client'

import { useState, useEffect } from 'react'

export default function DatePill() {
  const [hebrewDate, setHebrewDate] = useState('')

  const getHebrewDate = () => {
    const now = new Date()
    
    // Hebrew day names
    const hebrewDays = [
      'יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 
      'יום חמישי', 'יום שישי', 'יום שבת'
    ]
    
    // Hebrew month names
    const hebrewMonths = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ]
    
    const dayName = hebrewDays[now.getDay()]
    const day = now.getDate()
    const month = hebrewMonths[now.getMonth()]
    const year = now.getFullYear()
    
    return `${dayName}, ${day} ב${month} ${year}`
  }

  useEffect(() => {
    // Update date immediately
    setHebrewDate(getHebrewDate())
    
    // Update date every minute
    const interval = setInterval(() => {
      setHebrewDate(getHebrewDate())
    }, 60000) // 60 seconds
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className="hidden md:block bg-white text-black border-2 border-black px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
      role="status"
      aria-live="polite"
      aria-label={`תאריך נוכחי: ${hebrewDate}`}
    >
      {hebrewDate}
    </div>
  )
}
