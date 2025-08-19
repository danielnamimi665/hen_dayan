'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { FirestoreDataService } from '../services/firestoreData'

interface CustomerRow {
  id: string
  name: string
  phone: string
  notes: string
  status: string
}

interface CustomersData {
  activeCustomers: CustomerRow[]
  savedCustomers: CustomerRow[]
}

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

export default function CustomersPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [customersData, setCustomersData] = useState<CustomersData>({
    activeCustomers: [
      { id: 'customer-active-1', name: '', phone: '', notes: '', status: '' },
      { id: 'customer-active-2', name: '', phone: '', notes: '', status: '' }
    ],
    savedCustomers: [
      { id: 'customer-saved-1', name: '', phone: '', notes: '', status: '' },
      { id: 'customer-saved-2', name: '', phone: '', notes: '', status: '' }
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
    const monthKey = month + 1
    const key = `customers:${year}-${String(monthKey).padStart(2, '0')}`
    try {
      const cloud = await FirestoreDataService.load<CustomersData>('customers', `${year}-${String(monthKey).padStart(2, '0')}`)
      if (cloud && cloud.activeCustomers && cloud.savedCustomers) {
        setCustomersData(cloud)
        console.log(`[Cloud] Loaded customers for ${monthKey}/${year}`)
        return
      }
    } catch {}
    const saved = localStorage.getItem(key)
    
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data && data.activeCustomers && data.savedCustomers) {
          // Ensure all rows have the correct IDs
          const updatedData = {
            activeCustomers: data.activeCustomers.map((row: CustomerRow, index: number) => ({
              ...row,
              id: row.id || `customer-active-${index + 1}`
            })),
            savedCustomers: data.savedCustomers.map((row: CustomerRow, index: number) => ({
              ...row,
              id: row.id || `customer-saved-${index + 1}`
            }))
          }
          setCustomersData(updatedData)
          console.log(`Loaded customers data for ${monthKey}/${year}`)
        } else {
                     // Reset to default if data is invalid
           const defaultData = {
             activeCustomers: [
               { id: 'customer-active-1', name: '', phone: '', notes: '', status: '' },
               { id: 'customer-active-2', name: '', phone: '', notes: '', status: '' }
             ],
             savedCustomers: [
               { id: 'customer-saved-1', name: '', phone: '', notes: '', status: '' },
               { id: 'customer-saved-2', name: '', phone: '', notes: '', status: '' }
             ]
           }
          setCustomersData(defaultData)
        }
      } catch (error) {
                 console.error('Error parsing saved data:', error)
         const defaultData = {
           activeCustomers: [
             { id: 'customer-active-1', name: '', phone: '', notes: '', status: '' },
             { id: 'customer-active-2', name: '', phone: '', notes: '', status: '' }
           ],
           savedCustomers: [
             { id: 'customer-saved-1', name: '', phone: '', notes: '', status: '' },
             { id: 'customer-saved-2', name: '', phone: '', notes: '', status: '' }
           ]
         }
        setCustomersData(defaultData)
      }
    } else {
             // Default data for new month/year
       const defaultData = {
         activeCustomers: [
           { id: 'customer-active-1', name: '', phone: '', notes: '', status: '' },
           { id: 'customer-active-2', name: '', phone: '', notes: '', status: '' }
         ],
         savedCustomers: [
           { id: 'customer-saved-1', name: '', phone: '', notes: '', status: '' },
           { id: 'customer-saved-2', name: '', phone: '', notes: '', status: '' }
         ]
       }
      setCustomersData(defaultData)
    }
  }, [])

  // Save data to Firestore (and localStorage backup)
  const saveData = useCallback(async (data: CustomersData, year: number, month: number) => {
    try {
      const monthKey = month + 1
      const key = `customers:${year}-${String(monthKey).padStart(2, '0')}`
      try {
        const ok = await FirestoreDataService.save<CustomersData>('customers', `${year}-${String(monthKey).padStart(2, '0')}`, data)
        if (ok) console.log(`[Cloud] Saved customers for ${monthKey}/${year}`)
      } catch {}
      localStorage.setItem(key, JSON.stringify(data))
      console.log(`Saved customers data for ${monthKey}/${year}`)
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }, [])

  // Add new row to both tables
  const addRow = () => {
    const newActiveRow: CustomerRow = {
      id: `customer-active-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      phone: '',
      notes: '',
      status: ''
    }
    
    const newSavedRow: CustomerRow = {
      id: `customer-saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      phone: '',
      notes: '',
      status: ''
    }
    
    const newData = {
      ...customersData,
      activeCustomers: [...customersData.activeCustomers, newActiveRow],
      savedCustomers: [...customersData.savedCustomers, newSavedRow]
    }
    setCustomersData(newData)
    saveData(newData, selectedYear, selectedMonth)
  }

  // Manual save button handler – persists both tables for current month/year
  const handleManualSave = () => {
    try {
      saveData(customersData, selectedYear, selectedMonth)
      setMessage('הנתונים נשמרו')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      /* no-op */
    }
  }

  // Delete row from active customers (V button) - Clear row content
  const deleteActiveRow = (id: string) => {
    const newData = {
      ...customersData,
      activeCustomers: customersData.activeCustomers.map(row =>
        row.id === id
          ? { ...row, name: '', phone: '', notes: '', status: '' }
          : row
      )
    }
    setCustomersData(newData)
    saveData(newData, selectedYear, selectedMonth)
    
    // Show message
    setMessage('תוכן השורה נמחק')
    setTimeout(() => setMessage(''), 3000) // Clear message after 3 seconds
  }

  // Save row from active to saved customers (שמור button)
  const saveRow = (id: string) => {
    const rowToSave = customersData.activeCustomers.find(row => row.id === id)
    if (!rowToSave) return

    // Find the first empty row in saved customers
    const emptyRowIndex = customersData.savedCustomers.findIndex(row => 
      row.name === '' && row.phone === '' && row.notes === ''
    )

    if (emptyRowIndex === -1) {
      // No empty rows found, show message to user
      setMessage('אין שורות פנויות בטבלה התחתונה. מחק שורה קיימת תחילה.')
      setTimeout(() => setMessage(''), 3000) // Clear message after 3 seconds
      return
    }

    // Update the empty row with the data from active customers AND clear the active row
    const newData = {
      ...customersData,
      activeCustomers: customersData.activeCustomers.map(row =>
        row.id === id
          ? { ...row, name: '', phone: '', notes: '', status: '' }
          : row
      ),
      savedCustomers: customersData.savedCustomers.map((row, index) =>
        index === emptyRowIndex ? { ...row, ...rowToSave } : row
      )
    }

    setCustomersData(newData)
    saveData(newData, selectedYear, selectedMonth)
    
    // Show success message
    setMessage(`הלקוח נשמר בשורה ${emptyRowIndex + 1} בטבלה התחתונה`)
    setTimeout(() => setMessage(''), 3000) // Clear message after 3 seconds
  }

  // Delete row from saved customers (V button) - Clear row content
  const deleteSavedRow = (id: string) => {
    const newData = {
      ...customersData,
      savedCustomers: customersData.savedCustomers.map(row =>
        row.id === id
          ? { ...row, name: '', phone: '', notes: '', status: '' }
          : row
      )
    }
    setCustomersData(newData)
    saveData(newData, selectedYear, selectedMonth)
    
    // Show message
    setMessage('תוכן השורה נמחק')
    setTimeout(() => setMessage(''), 3000) // Clear message after 3 seconds
  }

  // Handle input changes
  const handleActiveCustomerChange = (id: string, field: keyof CustomerRow, value: string) => {
    const newData = {
      ...customersData,
      activeCustomers: customersData.activeCustomers.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    }
    setCustomersData(newData)
    saveData(newData, selectedYear, selectedMonth)
  }

  // No editing for saved customers - read only
  const handleSavedCustomerChange = (id: string, field: keyof CustomerRow, value: string) => {
    // Do nothing - saved customers are read-only
    return
  }

  // Delete row from active customers with X button - Delete permanently
  const deleteActiveRowWithX = (id: string) => {
    if (customersData.activeCustomers.length <= 2) return // Keep minimum 2 rows
    
    const newData = {
      ...customersData,
      activeCustomers: customersData.activeCustomers.filter(row => row.id !== id)
    }
    setCustomersData(newData)
    saveData(newData, selectedYear, selectedMonth)
    
    // Show message
    setMessage('השורה נמחקה לצמיתות')
    setTimeout(() => setMessage(''), 3000) // Clear message after 3 seconds
  }

  // Delete row from saved customers with X button - Delete permanently
  const deleteSavedRowWithX = (id: string) => {
    if (customersData.savedCustomers.length <= 2) return // Keep minimum 2 rows
    
    const newData = {
      ...customersData,
      savedCustomers: customersData.savedCustomers.filter(row => row.id !== id)
    }
    setCustomersData(newData)
    saveData(newData, selectedYear, selectedMonth)
    
    // Show message
    setMessage('השורה נמחקה לצמיתות')
    setTimeout(() => setMessage(''), 3000) // Clear message after 3 seconds
  }

  // Handle month selection
  const handleMonthSelect = (month: number) => {
    // Save current data before switching month
    saveData(customersData, selectedYear, selectedMonth)
    setSelectedMonth(month)
    setShowMonthDropdown(false)
    loadData(selectedYear, month)
  }

  // Handle year selection
  const handleYearSelect = (year: number) => {
    // Save current data before switching year
    saveData(customersData, selectedYear, selectedMonth)
    setSelectedYear(year)
    setShowYearDropdown(false)
    loadData(year, selectedMonth)
  }

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

  // הוסר auto-save כדי למנוע דריסה של נתונים מהענן בהטענת דף.
  // נתונים נשמרים מיידית בכל שינוי (add/delete/update) וב-beforeunload.

  // Save on tab close/refresh as safety
  useEffect(() => {
    const onBeforeUnload = () => {
      try { saveData(customersData, selectedYear, selectedMonth) } catch {}
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        try { saveData(customersData, selectedYear, selectedMonth) } catch {}
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [customersData, selectedYear, selectedMonth, saveData])

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
           <div className="bg-white/90 border-2 border-black rounded-3xl px-8 py-4 shadow-lg">
             <h1 className="text-4xl font-bold text-black text-center lg:text-4xl lg:mb-0 text-3xl mb-0">חזרה ללקוחות</h1>
           </div>
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
            הוסף שורה
          </button>
          {/* Manual Save Button */}
          <button
            onClick={handleManualSave}
            className="bg-white/90 text-black border-2 border-black px-6 py-3 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black transition-colors font-medium"
          >
            שמור
          </button>
        </div>
        
        {/* Message Display */}
        {message && (
          <div className="mt-4 text-center">
            <div className={`inline-block px-4 py-2 rounded-lg text-white font-medium ${
              message.includes('אין שורות פנויות') 
                ? 'bg-red-600' 
                : 'bg-green-600'
            }`}>
              {message}
            </div>
          </div>
        )}
      </div>

      {/* First Table - חזרה ללקוחות */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">חזרה ללקוחות</h2>
        <div className="bg-white/90 rounded-lg shadow-lg overflow-hidden border-2 border-black max-w-4xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-white/90 border-2 border-black">
                  <th className="px-4 py-3 text-right font-bold text-black border-b-2 border-black border-l-2 border-black w-[150px]">
                    שם
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-black border-b-2 border-black border-l-2 border-black w-[120px]">
                    מספר טלפון
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-black border-b-2 border-black border-l-2 border-black w-[200px]">
                    הערות
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-black border-b-2 border-black border-l-2 border-black w-[180px]">
                    סטטוס
                  </th>
                </tr>
              </thead>
              <tbody>
                {customersData.activeCustomers.map((row) => (
                  <tr key={row.id} className="bg-white/90 border-b-2 border-black hover:bg-gray-50">
                    <td className="border-l-2 border-b-2 border-black p-2 w-[150px]">
                                             <input
                         type="text"
                         value={row.name}
                         onChange={(e) => handleActiveCustomerChange(row.id, 'name', e.target.value)}
                         className="w-full text-right border-none outline-none bg-transparent text-black"
                       />
                    </td>
                    <td className="border-l-2 border-b-2 border-black p-2 w-[120px]">
                                             <input
                         type="tel"
                         value={row.phone}
                         onChange={(e) => handleActiveCustomerChange(row.id, 'phone', e.target.value)}
                         className="w-full text-right border-none outline-none bg-transparent text-black"
                       />
                    </td>
                    <td className="border-l-2 border-b-2 border-black p-2 w-[200px]">
                                             <textarea
                         value={row.notes}
                         onChange={(e) => handleActiveCustomerChange(row.id, 'notes', e.target.value)}
                         className="w-full resize-none border-none outline-none bg-transparent text-black min-h-[40px]"
                         rows={1}
                         onInput={(e) => {
                           const target = e.target as HTMLTextAreaElement;
                           target.style.height = 'auto';
                           target.style.height = target.scrollHeight + 'px';
                         }}
                       />
                    </td>
                    <td className="border-b-2 border-r-2 border-black p-2 w-[180px]">
                      <div className="flex gap-2 justify-center">
                                                 <button
                           onClick={() => deleteActiveRow(row.id)}
                           className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors font-bold"
                           title="מחק תוכן השורה"
                         >
                           ✓
                         </button>
                        <button
                          onClick={() => saveRow(row.id)}
                          className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition-colors"
                          title="שמור לקוח"
                        >
                          שמור
                        </button>
                                                 <button
                           onClick={() => deleteActiveRowWithX(row.id)}
                           className="text-red-500 hover:text-red-700 text-xl font-bold w-8 h-8 rounded-full hover:bg-red-100 transition-colors"
                           title="מחק שורה לצמיתות"
                         >
                           ×
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Second Table - שמירת לקוח */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">שמירת לקוח</h2>
        <div className="bg-white/90 rounded-lg shadow-lg overflow-hidden border-2 border-black max-w-4xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-white/90 border-2 border-black">
                  <th className="px-4 py-3 text-right font-bold text-black border-b-2 border-black border-l-2 border-black w-[150px]">
                    שם
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-black border-b-2 border-black border-l-2 border-black w-[120px]">
                    מספר טלפון
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-black border-b-2 border-black border-l-2 border-black w-[200px]">
                    הערות
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-black border-b-2 border-black border-l-2 border-black w-[150px]">
                    סטטוס
                  </th>
                </tr>
              </thead>
              <tbody>
                {customersData.savedCustomers.map((row) => (
                  <tr key={row.id} className="bg-white/90 border-b-2 border-black hover:bg-gray-50">
                    <td className="border-l-2 border-b-2 border-black p-2 w-[150px]">
                                             <input
                         type="text"
                         value={row.name}
                         onChange={(e) => handleSavedCustomerChange(row.id, 'name', e.target.value)}
                         className="w-full text-right border-none outline-none bg-transparent text-black"
                         readOnly
                       />
                    </td>
                    <td className="border-l-2 border-b-2 border-black p-2 w-[120px]">
                                             <input
                         type="tel"
                         value={row.phone}
                         onChange={(e) => handleSavedCustomerChange(row.id, 'phone', e.target.value)}
                         className="w-full text-right border-none outline-none bg-transparent text-black"
                         readOnly
                       />
                    </td>
                    <td className="border-l-2 border-b-2 border-black p-2 w-[200px]">
                                             <textarea
                         value={row.notes}
                         onChange={(e) => handleSavedCustomerChange(row.id, 'notes', e.target.value)}
                         className="w-full resize-none border-none outline-none bg-transparent text-black min-h-[40px]"
                         rows={1}
                         readOnly
                       />
                    </td>
                    <td className="border-b-2 border-r-2 border-black p-2 w-[150px]">
                      <div className="flex gap-2 justify-center">
                                                 <button
                           onClick={() => deleteSavedRow(row.id)}
                           className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors font-bold"
                           title="מחק תוכן השורה"
                         >
                           ✓
                         </button>
                                                 <button
                           onClick={() => deleteSavedRowWithX(row.id)}
                           className="text-red-500 hover:text-red-700 text-xl font-bold w-8 h-8 rounded-full hover:bg-red-100 transition-colors"
                           title="מחק שורה לצמיתות"
                         >
                           ×
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
