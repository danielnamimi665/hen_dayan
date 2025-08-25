'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { FirestoreDataService } from '../services/firestoreData'

interface WorkDayRow {
  id: string
  text: string
  cost: string
  date: string
}

interface WorkDaysData {
  rows: WorkDayRow[]
}

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

export default function WorkDays() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [workDaysData, setWorkDaysData] = useState<WorkDaysData>({
    rows: [
      { id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '', date: '' },
      { id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '', date: '' }
    ]
  })

  // Add refs for dropdowns
  const monthDropdownRef = useRef<HTMLDivElement>(null)
  const yearDropdownRef = useRef<HTMLDivElement>(null)

  // Generate years array (2025-2029)
  const generateYears = useCallback(() => {
    return [2025, 2026, 2027, 2028, 2029]
  }, [])

  // Load data from Firestore (with localStorage fallback)
  const loadData = useCallback(async (year: number, month: number) => {
    // month is 0-indexed (0-11), convert to 1-indexed (1-12) for localStorage key
    const monthKey = month + 1
    const key = `workdays:${year}-${String(monthKey).padStart(2, '0')}`
    try {
      const cloud = await FirestoreDataService.load<WorkDaysData>('workdays', `${year}-${String(monthKey).padStart(2, '0')}`)
      if (cloud && cloud.rows && Array.isArray(cloud.rows) && cloud.rows.length >= 2) {
        // Ensure all rows have date field using any to avoid type issues
        const rowsWithDate = (cloud.rows as any[]).map((row: any) => ({
          ...row,
          date: row.date ?? ''
        }))
        setWorkDaysData({ ...cloud, rows: rowsWithDate })
        console.log(`[Cloud] Loaded workdays ${monthKey}/${year}:`, cloud.rows.length, 'rows')
        return
      }
    } catch (e) {
      console.warn('[Cloud] workdays load failed, using localStorage if exists')
    }
    const saved = localStorage.getItem(key)
    
    if (saved) {
      try {
        const data = JSON.parse(saved)
        // Ensure data has the correct structure
        if (data && data.rows && Array.isArray(data.rows) && data.rows.length >= 2) {
          // Ensure all rows have date field using any to avoid type issues
          const rowsWithDate = (data.rows as any[]).map((row: any) => ({
            ...row,
            date: row.date ?? ''
          }))
          setWorkDaysData({ ...data, rows: rowsWithDate })
          console.log(`Loaded workdays data for ${monthKey}/${year}:`, data.rows.length, 'rows')
        } else {
                   // Reset to default if data is invalid
         const defaultData = {
           rows: [
             { id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '', date: '' },
             { id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '', date: '' }
           ]
         }
          setWorkDaysData(defaultData)
          // Don't save here to avoid overwriting existing data
        }
      } catch (error) {
        console.error('Error parsing saved data:', error)
                 // Reset to default on error
         const defaultData = {
           rows: [
             { id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '', date: '' },
             { id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '', date: '' }
           ]
         }
        setWorkDaysData(defaultData)
        // Don't save here to avoid overwriting existing data
      }
    } else {
             // Default data for new month/year - don't save automatically
       const defaultData = {
         rows: [
           { id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '', date: '' },
             { id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '', date: '' }
         ]
       }
      setWorkDaysData(defaultData)
      // Don't save here - let user make changes first
    }
  }, [])

  // Save data to Firestore (and also persist to localStorage as backup)
  const saveData = useCallback(async (data: WorkDaysData, year: number, month: number) => {
    try {
      // month is 0-indexed (0-11), convert to 1-indexed (1-12) for localStorage key
      const monthKey = month + 1
      const key = `workdays:${year}-${String(monthKey).padStart(2, '0')}`
      try {
        const ok = await FirestoreDataService.save<WorkDaysData>('workdays', `${year}-${String(monthKey).padStart(2, '0')}`, data)
        if (ok) console.log(`[Cloud] Saved workdays for ${monthKey}/${year}`)
      } catch (e) {
        console.warn('[Cloud] workdays save failed, keeping local backup')
      }
      localStorage.setItem(key, JSON.stringify(data))
      console.log(`Saved workdays data for ${monthKey}/${year}:`, data.rows.length, 'rows')
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }, [])

  // Calculate total cost
  const calculateTotal = useCallback((rows: WorkDayRow[]) => {
    return rows.reduce((sum, row) => {
      const cost = parseFloat(row.cost.replace(',', '.')) || 0
      return sum + cost
    }, 0)
  }, [])

  // Add new row
  const addRow = () => {
    const newRow: WorkDayRow = {
      id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      cost: '',
      date: ''
    }
    const newData = {
      ...workDaysData,
      rows: [...workDaysData.rows, newRow]
    }
    setWorkDaysData(newData)
    // Save immediately after adding row - only for current month/year
    saveData(newData, selectedYear, selectedMonth)
  }

  // Remove row
  const removeRow = (id: string) => {
    if (workDaysData.rows.length <= 2) return // Keep minimum 2 rows + total
    
    const newData = {
      ...workDaysData,
      rows: workDaysData.rows.filter(row => row.id !== id)
    }
    setWorkDaysData(newData)
    // Save immediately after removing row - only for current month/year
    saveData(newData, selectedYear, selectedMonth)
  }

  // Update row data
  const updateRow = (id: string, field: 'text' | 'cost' | 'date', value: string) => {
    const newData = {
      ...workDaysData,
      rows: workDaysData.rows.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    }
    setWorkDaysData(newData)
    // Save immediately after any change - only for current month/year
    saveData(newData, selectedYear, selectedMonth)
  }

  // Handle cost input validation
  const handleCostChange = (id: string, value: string) => {
    // Only allow numbers, decimal point, and comma
    const cleaned = value.replace(/[^\d.,]/g, '')
    // Convert comma to decimal point
    const normalized = cleaned.replace(',', '.')
    // Ensure only one decimal point
    const parts = normalized.split('.')
    if (parts.length <= 2) {
      updateRow(id, 'cost', cleaned)
    }
  }

  const handleNumberChange = (index: number, value: string) => {
    const newRows = [...workDaysData.rows];
    newRows[index] = { ...newRows[index], cost: value };
    const newData = { ...workDaysData, rows: newRows };
    setWorkDaysData(newData);
    // Save immediately after any change - only for current month/year
    saveData(newData, selectedYear, selectedMonth);
  };

  const handleTextChange = (index: number, value: string) => {
    const newRows = [...workDaysData.rows];
    newRows[index] = { ...newRows[index], text: value };
    const newData = { ...workDaysData, rows: newRows };
    setWorkDaysData(newData);
    // Save immediately after any change - only for current month/year
    saveData(newData, selectedYear, selectedMonth);
  };

  const handleDateChange = (index: number, value: string) => {
    const newRows = [...workDaysData.rows];
    newRows[index] = { ...newRows[index], date: value };
    const newData = { ...workDaysData, rows: newRows };
    setWorkDaysData(newData);
    // Save immediately after any change - only for current month/year
    saveData(newData, selectedYear, selectedMonth);
  };

  // Handle month selection
  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month)
    setShowMonthDropdown(false)
         // Clear current data before loading new month data
     setWorkDaysData({
       rows: [
         { id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '', date: '' },
         { id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '', date: '' }
       ]
     })
    // Load data for the new month
    loadData(selectedYear, month)
  }

  // Handle year selection
  const handleYearSelect = (year: number) => {
    setSelectedYear(year)
    setShowYearDropdown(false)
         // Clear current data before loading new year data
     setWorkDaysData({
       rows: [
         { id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '', date: '' },
         { id: `workday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '', cost: '', date: '' }
       ]
     })
    // Load data for the new year
    loadData(year, selectedMonth)
  }

  // Load data when component mounts or month/year changes
  useEffect(() => {
    loadData(selectedYear, selectedMonth)
  }, [loadData, selectedYear, selectedMonth])

  // Initial load only - don't reload on every change
  useEffect(() => {
    // Load initial data for current month/year
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    if (currentMonth !== selectedMonth || currentYear !== selectedYear) {
      setSelectedMonth(currentMonth)
      setSelectedYear(currentYear)
    }
    
    loadData(currentYear, currentMonth)
  }, []) // Empty dependency array - only run once on mount

  // Auto-save data every 5 seconds to ensure data persistence
  useEffect(() => {
    const interval = setInterval(() => {
      // Save current data every 5 seconds - only for current month/year
      saveData(workDaysData, selectedYear, selectedMonth)
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [workDaysData, selectedYear, selectedMonth, saveData])

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

  const totalCost = calculateTotal(workDaysData.rows)
  // const years = generateYears() // This line was removed

  return (
    <div className="min-h-screen bg-transparent p-4 rtl">
      {/* Header */}
      <div className="mb-8">
                 {/* Category title without styled rectangle */}
         <div className="mb-4 flex justify-center">
           <h1 className="text-4xl font-bold text-white text-center lg:text-4xl lg:mb-0 text-3xl mb-0 drop-shadow-lg">ימי עבודה</h1>
         </div>
        
        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
           {/* Month Dropdown */}
           <div className="relative" ref={monthDropdownRef}>
             <button
               onClick={() => setShowMonthDropdown(!showMonthDropdown)}
               className="bg-white/90 text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm border-2 border-black"
             >
               <span>{HEBREW_MONTHS[selectedMonth]}</span>
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
                     onClick={() => handleMonthSelect(index)}
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
             onClick={addRow}
             className="bg-white/90 text-black border-2 border-black px-6 py-3 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black transition-colors font-medium"
           >
             הוסף
           </button>
         </div>
       </div>

       {/* Table */}
       <div className="bg-white/90 rounded-lg shadow-lg overflow-hidden border-2 border-black w-full mx-1 sm:mx-2">
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-white/90 border-2 border-black">
                <th className="px-2 sm:px-4 py-3 text-right font-bold text-black border-b-2 border-black w-[45%] sm:w-[300px]">
                  פירוט
                </th>
                <th className="px-2 sm:px-4 py-3 text-center font-bold text-black border-b-2 border-black border-r-2 border-l-2 border-black w-[25%] sm:w-[150px]">
                  עלות
                </th>
                <th className="px-2 sm:px-4 py-3 text-center font-bold text-black border-b-2 border-black w-[25%] sm:w-[150px]">
                  תאריך
                </th>
                <th className="px-1 sm:px-4 py-3 w-[5%] sm:w-16 border-b-2 border-black"></th>
              </tr>
            </thead>
            <tbody>
              {workDaysData.rows.map((row, index) => (
                <tr key={row.id} className="bg-white/90 border-b-2 border-black hover:bg-gray-50">
                  <td className="border-l-2 border-b-2 border-black p-1 sm:p-2 w-[45%] sm:w-[300px]">
                    <textarea
                      value={row.text}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      className="w-full resize-none border-none outline-none bg-transparent text-black font-bold text-[16px] sm:text-sm placeholder-black min-h-[40px] max-h-[120px] overflow-y-auto"
                      placeholder=""
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        const newHeight = Math.min(target.scrollHeight, 120);
                        target.style.height = newHeight + 'px';
                      }}
                    />
                  </td>
                  <td className="border-b-2 border-r-2 border-l-2 border-black p-1 sm:p-2 w-[25%] sm:w-[150px]">
                    <input
                      type="text"
                      value={row.cost}
                      onChange={(e) => handleNumberChange(index, e.target.value)}
                      className="w-full text-center border-none outline-none bg-transparent text-black placeholder-black text-[16px] sm:text-sm truncate"
                      placeholder="0"
                      inputMode="decimal"
                    />
                  </td>
                  <td className="border-b-2 border-r-2 border-black p-1 sm:p-2 w-[25%] sm:w-[150px]">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => handleDateChange(index, e.target.value)}
                      className="w-full text-right border-none outline-none bg-transparent text-black text-[16px] sm:text-sm"
                    />
                  </td>
                  <td className="px-1 sm:px-2 py-2 text-center border-b-2 border-black w-[5%] sm:w-16">
                    {workDaysData.rows.length > 2 && (
                      <button
                        onClick={() => removeRow(row.id)}
                        className="text-red-500 hover:text-red-700 text-base sm:text-lg font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-red-100 transition-colors"
                        title="מחק שורה"
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {/* Total Row */}
              <tr className="bg-white/90 border-2 border-black font-bold">
                <td className="px-2 sm:px-4 py-3 text-right text-black border-t-2 border-black border-r-2 border-black w-[45%] sm:w-[300px]">
                  סה״כ
                </td>
                <td className="px-2 sm:px-4 py-3 text-black border-t-2 border-black border-r-2 border-l-2 border-black w-[25%] sm:w-[150px]">
                  <div className="flex items-center justify-center h-full">
                    <span className="text-center whitespace-nowrap text-[16px] sm:text-sm">
                      ₪{Math.round(totalCost).toLocaleString('en-US')}
                    </span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 border-t-2 border-r-2 border-black w-[25%] sm:w-[150px]"></td>
                <td className="px-1 sm:px-2 py-3 border-t-2 border-black w-[5%] sm:w-16"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
