'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FirestoreDataService } from '../services/firestoreData'

interface ExpenseRow {
  id: string
  text: string
  cost: string
}

interface ExpensesData {
  rows: ExpenseRow[]
}

export default function ExpensesPage() {
  // Helper function to generate unique ID
  const generateUUID = () => {
    return `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [expensesData, setExpensesData] = useState<ExpensesData>({
    rows: [
      { id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '' },
      { id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '' }
    ]
  })

  const monthDropdownRef = useRef<HTMLDivElement>(null)
  const yearDropdownRef = useRef<HTMLDivElement>(null)

  const HEBREW_MONTHS = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ]

  // Generate years array (current + 4 future)
  const generateYears = useCallback(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => currentYear + i)
  }, [])

  // Load expenses from Firestore (with localStorage fallback)
  const loadExpenses = useCallback(async (month: number, year: number) => {
    try {
      const key = `expenses:${year}-${month.toString().padStart(2, '0')}`
      try {
        const cloud = await FirestoreDataService.load<ExpensesData>('expenses', `${year}-${month.toString().padStart(2, '0')}`)
        if (cloud && Array.isArray(cloud.rows) && cloud.rows.length >= 2) {
          setExpensesData(cloud)
          console.log(`[Cloud] Loaded expenses for ${month}/${year}:`, cloud.rows.length, 'rows')
          return
        }
      } catch {
        console.warn('[Cloud] expenses load failed, using localStorage if exists')
      }
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && Array.isArray(parsed.rows) && parsed.rows.length >= 2) {
          setExpensesData(parsed)
          console.log(`Loaded expenses for ${month}/${year}:`, parsed.rows.length, 'rows')
        } else {
                   // Reset to default if data is invalid
         setExpensesData({
           rows: [
             { id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '' },
             { id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '' }
           ]
         })
        }
      } else {
               // Initialize with default data
       setExpensesData({
         rows: [
           { id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '' },
           { id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '' }
         ]
       })
      }
    } catch (error) {
      console.error('Error loading expenses:', error)
                  // Reset to default on error
     setExpensesData({
       rows: [
         { id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '' },
         { id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '' }
       ]
     })
    }
  }, [])

  // Save expenses to Firestore (and localStorage backup)
  const saveExpenses = useCallback(async (data: ExpensesData, month: number, year: number) => {
    try {
      const key = `expenses:${year}-${month.toString().padStart(2, '0')}`
      try {
        const ok = await FirestoreDataService.save<ExpensesData>('expenses', `${year}-${month.toString().padStart(2, '0')}` , data)
        if (ok) console.log(`[Cloud] Saved expenses for ${month}/${year}`)
      } catch {}
      localStorage.setItem(key, JSON.stringify(data))
      console.log(`Saved expenses for ${month}/${year}:`, data.rows.length, 'rows')
    } catch (error) {
      console.error('Error saving expenses:', error)
    }
  }, [])

  // Handle month selection
  const handleMonthSelect = (month: number) => {
    // Save current month before switching
    saveExpenses(expensesData, selectedMonth, selectedYear)
    setSelectedMonth(month)
    setShowMonthDropdown(false)
    loadExpenses(month, selectedYear)
  }

  // Handle year selection
  const handleYearSelect = (year: number) => {
    // Save current year before switching
    saveExpenses(expensesData, selectedMonth, selectedYear)
    setSelectedYear(year)
    setShowYearDropdown(false)
    loadExpenses(selectedMonth, year)
  }

  // Handle text change
  const handleTextChange = (id: string, value: string) => {
    const updatedData = {
      ...expensesData,
      rows: expensesData.rows.map(row =>
        row.id === id ? { ...row, text: value } : row
      )
    }
    setExpensesData(updatedData)
    saveExpenses(updatedData, selectedMonth, selectedYear)
  }

  // Handle cost change
  const handleCostChange = (id: string, value: string) => {
    // Only allow numbers and decimal points
    const numericValue = value.replace(/[^0-9.,]/g, '').replace(',', '.')
    
    const updatedData = {
      ...expensesData,
      rows: expensesData.rows.map(row =>
        row.id === id ? { ...row, cost: numericValue } : row
      )
    }
    setExpensesData(updatedData)
    saveExpenses(updatedData, selectedMonth, selectedYear)
  }

  // Add new row
  const handleAddRow = () => {
    const newRow = { id: generateUUID(), text: '', cost: '' }
    const updatedData = {
      ...expensesData,
      rows: [...expensesData.rows.slice(0, -1), newRow, expensesData.rows[expensesData.rows.length - 1]]
    }
    setExpensesData(updatedData)
    saveExpenses(updatedData, selectedMonth, selectedYear)
  }

  // Delete row
  const handleDeleteRow = (id: string) => {
    if (expensesData.rows.length > 2) {
      const updatedData = {
        ...expensesData,
        rows: expensesData.rows.filter(row => row.id !== id)
      }
      setExpensesData(updatedData)
      saveExpenses(updatedData, selectedMonth, selectedYear)
    }
  }

  // Calculate total cost
  const totalCost = expensesData.rows.reduce((sum, row) => {
    const cost = parseFloat(row.cost) || 0
    return sum + cost
  }, 0)

  // Load expenses when component mounts or month/year changes
  useEffect(() => {
    loadExpenses(selectedMonth, selectedYear)
  }, [loadExpenses, selectedMonth, selectedYear])

  // Save on tab close/refresh for safety
  useEffect(() => {
    const onBeforeUnload = () => {
      try { saveExpenses(expensesData, selectedMonth, selectedYear) } catch {}
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [expensesData, selectedMonth, selectedYear, saveExpenses])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false)
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setShowYearDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen bg-transparent p-4 rtl">
      {/* Header */}
      <div className="mb-8">
                 {/* Category title with styled rectangle */}
         <div className="mb-4 flex justify-center">
           <div className="bg-white border-2 border-black rounded-3xl px-8 py-4 shadow-lg">
             <h1 className="text-4xl font-bold text-black text-center lg:text-4xl lg:mb-0 text-3xl mb-0">הוצאות</h1>
           </div>
         </div>
        
        {/* Month/Year Selectors */}
        <div className="flex justify-center gap-4 mb-6">
          {/* Month Dropdown */}
          <div className="relative" ref={monthDropdownRef}>
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="bg-white/90 text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm border-2 border-black"
            >
              <span>{HEBREW_MONTHS[selectedMonth - 1]}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showMonthDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                {HEBREW_MONTHS.map((month, index) => (
                  <button
                    key={index}
                    onClick={() => handleMonthSelect(index + 1)}
                    className="w-full text-right px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 text-black text-sm"
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="relative" ref={yearDropdownRef}>
            <button
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="bg-white/90 text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm border-2 border-black"
            >
              <span>{selectedYear}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showYearDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[100px]">
                {generateYears().map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className="w-full text-right px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 text-black text-sm"
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Row Button */}
          <button
            onClick={handleAddRow}
            className="bg-white/90 text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm border-2 border-black"
          >
            הוסף
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="flex justify-center">
        <div className="bg-white/90 rounded-lg shadow-lg overflow-hidden border-2 border-black max-w-4xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-white/90 border-2 border-black">
                  <th className="px-6 py-3 text-right font-bold text-black border-b-2 border-black w-[200px]">
                    מלל חופשי
                  </th>
                  <th className="px-6 py-3 text-right font-bold text-black border-b-2 border-black border-r-4 border-r-black w-[100px]">
                    <span className="whitespace-nowrap">עלות הוצאה</span>
                  </th>
                  <th className="px-4 py-3 w-16 border-b-2 border-black"></th>
                </tr>
              </thead>
              <tbody>
                {expensesData.rows.map((row, index) => (
                  <tr key={row.id} className="bg-white/90 border-b-2 border-black hover:bg-gray-50">
                    <td className="border-l-2 border-b-2 border-black p-2 w-[200px]">
                      <textarea
                        value={row.text}
                        onChange={(e) => handleTextChange(row.id, e.target.value)}
                        className="w-full h-auto min-h-[24px] bg-transparent text-black text-right resize-none overflow-hidden focus:outline-none font-bold text-base"
                        rows={1}
                        onInput={(e) => {
                          e.currentTarget.style.height = 'auto'
                          e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'
                        }}
                      />
                    </td>
                    <td className="border-b-2 border-r-4 border-black border-r-black p-2 w-[100px]">
                      <input
                        type="text"
                        value={row.cost}
                        onChange={(e) => handleCostChange(row.id, e.target.value)}
                        className="w-full bg-transparent text-black text-right focus:outline-none"
                        inputMode="decimal"
                      />
                    </td>
                    <td className="px-4 py-2 text-center border-b-2 border-black w-16">
                      {expensesData.rows.length > 2 && (
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-lg"
                        >
                          X
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-white/90 border-2 border-black font-bold">
                  <td className="px-6 py-3 text-right text-black border-t-2 border-black border-r-4 border-r-black w-[200px]">
                    סה״כ
                  </td>
                  <td className="px-6 py-3 text-right text-black border-t-2 border-black border-r-4 border-r-black w-[100px]">
                    ₪{totalCost.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 border-t-2 border-black w-16"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
