'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ToolTable {
  id: string
  title: string
  rows: ToolRow[]
}

interface ToolRow {
  id: string
  text: string
}

interface ToolsData {
  tables: ToolTable[]
}

export default function ToolsMaintenancePage() {
  // Helper function to generate unique ID
  const generateUUID = () => {
    return `tools-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [toolsData, setToolsData] = useState<ToolsData>({
    tables: [
      {
        id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: 'טבלה 1',
        rows: [
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
        ]
      },
      {
        id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: 'טבלה 2',
        rows: [
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
        ]
      },
      {
        id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: 'טבלה 3',
        rows: [
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
        ]
      },
      {
        id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: 'טבלה 4',
        rows: [
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
        ]
      },
      {
        id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: 'טבלה 5',
        rows: [
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
          { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
        ]
      }
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

  // Load tools data from localStorage
  const loadToolsData = useCallback((month: number, year: number) => {
    try {
      const key = `tools:${year}-${month.toString().padStart(2, '0')}`
      const saved = localStorage.getItem(key)
      
      // Load global titles first
      let globalTitles: Record<string, string> = {}
      try {
        const globalKey = `tools_titles_global`
        globalTitles = JSON.parse(localStorage.getItem(globalKey) || '{}')
      } catch (error) {
        console.error('Error loading global titles:', error)
      }
      
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && Array.isArray(parsed.tables) && parsed.tables.length === 5) {
          // Apply global titles to loaded data by position
          const updatedTables = parsed.tables.map((table: ToolTable, index: number) => ({
            ...table,
            title: globalTitles[`table-${index + 1}`] || table.title
          }))
          
          setToolsData({ ...parsed, tables: updatedTables })
          console.log(`Loaded tools data for ${month}/${year}:`, updatedTables.length, 'tables')
        } else {
                     // Reset to default if data is invalid
           const defaultData = {
             tables: [
               {
                 id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                 title: globalTitles['table-1'] || 'טבלה 1',
                 rows: [
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
                 ]
               },
               {
                 id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                 title: globalTitles['table-2'] || 'טבלה 2',
                 rows: [
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
                 ]
               },
               {
                 id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                 title: globalTitles['table-3'] || 'טבלה 3',
                 rows: [
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
                 ]
               },
               {
                 id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                 title: globalTitles['table-4'] || 'טבלה 4',
                 rows: [
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
                 ]
               },
               {
                 id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                 title: globalTitles['table-5'] || 'טבלה 5',
                 rows: [
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
                   { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
                 ]
               }
             ]
           }
          setToolsData(defaultData)
        }
      } else {
                          // Initialize with default data
         const defaultData = {
           tables: [
             {
               id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
               title: globalTitles['table-1'] || 'טבלה 1',
               rows: [
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
               ]
             },
             {
               id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
               title: globalTitles['table-2'] || 'טבלה 2',
               rows: [
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
               ]
             },
             {
               id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
               title: globalTitles['table-3'] || 'טבלה 3',
               rows: [
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
               ]
             },
             {
               id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
               title: globalTitles['table-4'] || 'טבלה 4',
               rows: [
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
               ]
             },
             {
               id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
               title: globalTitles['table-5'] || 'טבלה 5',
               rows: [
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
                 { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
               ]
             }
           ]
         }
        setToolsData(defaultData)
      }
    } catch (error) {
      console.error('Error loading tools data:', error)
             // Reset to default on error
       setToolsData({
         tables: [
           {
             id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
             title: 'טבלה 1',
             rows: [
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
             ]
           },
           {
             id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
             title: 'טבלה 2',
             rows: [
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
             ]
           },
           {
             id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
             title: 'טבלה 3',
             rows: [
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
             ]
           },
           {
             id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
             title: 'טבלה 4',
             rows: [
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
             ]
           },
           {
             id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
             title: 'טבלה 5',
             rows: [
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-1`, text: '' },
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-2`, text: '' },
               { id: `tools-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-row-3`, text: '' }
             ]
           }
         ]
       })
    }
  }, [])

  // Save tools data to localStorage
  const saveToolsData = useCallback((data: ToolsData, month: number, year: number) => {
    try {
      const key = `tools:${year}-${month.toString().padStart(2, '0')}`
      localStorage.setItem(key, JSON.stringify(data))
      console.log(`Saved tools data for ${month}/${year}:`, data.tables.length, 'tables')
    } catch (error) {
      console.error('Error saving tools data:', error)
    }
  }, [])

  // Handle month selection
  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month)
    setShowMonthDropdown(false)
    loadToolsData(month, selectedYear)
  }

  // Handle year selection
  const handleYearSelect = (year: number) => {
    setSelectedYear(year)
    setShowYearDropdown(false)
    loadToolsData(selectedMonth, year)
  }

  // Handle table title change
  const handleTableTitleChange = (tableId: string, newTitle: string) => {
    // Find the table index to save the title by position
    const tableIndex = toolsData.tables.findIndex(table => table.id === tableId)
    if (tableIndex === -1) return
    
    // Update the title globally for all months/years
    const updatedData = {
      ...toolsData,
      tables: toolsData.tables.map(table =>
        table.id === tableId
          ? { ...table, title: newTitle }
          : table
      )
    }
    setToolsData(updatedData)
    
    // Save to localStorage for current month/year
    saveToolsData(updatedData, selectedMonth, selectedYear)
    
    // Also save the title globally for all months by position
    try {
      const globalKey = `tools_titles_global`
              const globalTitles: Record<string, string> = JSON.parse(localStorage.getItem(globalKey) || '{}')
      globalTitles[`table-${tableIndex + 1}`] = newTitle
      localStorage.setItem(globalKey, JSON.stringify(globalTitles))
      console.log('Table title saved globally by position:', `table-${tableIndex + 1}`, newTitle)
      
      // Update all existing month/year combinations with the new title
      const currentYear = new Date().getFullYear()
      for (let year = currentYear; year <= currentYear + 4; year++) {
        for (let month = 1; month <= 12; month++) {
          const key = `tools:${year}-${month.toString().padStart(2, '0')}`
          const existingData = localStorage.getItem(key)
          if (existingData) {
            try {
              const parsed = JSON.parse(existingData)
              if (parsed && Array.isArray(parsed.tables) && parsed.tables[tableIndex]) {
                const updatedTables = [...parsed.tables]
                updatedTables[tableIndex] = { ...updatedTables[tableIndex], title: newTitle }
                const updatedData = { ...parsed, tables: updatedTables }
                localStorage.setItem(key, JSON.stringify(updatedData))
                console.log(`Updated table title for ${month}/${year} at position ${tableIndex + 1}:`, newTitle)
              }
            } catch (error) {
              console.error(`Error updating table title for ${month}/${year}:`, error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error saving global title:', error)
    }
  }

  // Handle text change in table
  const handleTextChange = (tableId: string, rowId: string, value: string) => {
    const updatedData = {
      ...toolsData,
      tables: toolsData.tables.map(table =>
        table.id === tableId
          ? {
              ...table,
              rows: table.rows.map(row =>
                row.id === rowId ? { ...row, text: value } : row
              )
            }
          : table
      )
    }
    setToolsData(updatedData)
    saveToolsData(updatedData, selectedMonth, selectedYear)
  }

  // Add new row to a specific table
  const handleAddRow = (tableId: string) => {
    const newRow = { id: generateUUID(), text: '' }
    const updatedData = {
      ...toolsData,
      tables: toolsData.tables.map(table =>
        table.id === tableId
          ? {
              ...table,
              rows: [...table.rows, newRow]
            }
          : table
      )
    }
    setToolsData(updatedData)
    saveToolsData(updatedData, selectedMonth, selectedYear)
  }

  // Delete row from a specific table
  const handleDeleteRow = (tableId: string, rowId: string) => {
    const updatedData = {
      ...toolsData,
      tables: toolsData.tables.map(table =>
        table.id === tableId
          ? {
              ...table,
              rows: table.rows.filter(row => row.id !== rowId)
            }
          : table
      )
    }
    setToolsData(updatedData)
    saveToolsData(updatedData, selectedMonth, selectedYear)
  }

  // Load tools data when component mounts or month/year changes
  useEffect(() => {
    loadToolsData(selectedMonth, selectedYear)
  }, [loadToolsData, selectedMonth, selectedYear])

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
             <h1 className="text-4xl font-bold text-black text-center lg:text-4xl lg:mb-0 text-3xl mb-0">טיפול כלים</h1>
           </div>
         </div>
        
        {/* Month/Year Selectors */}
        <div className="flex justify-center gap-4 mb-6">
          {/* Month Dropdown */}
          <div className="relative" ref={monthDropdownRef}>
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm border-2 border-black"
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
              className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm border-2 border-black"
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
        </div>
      </div>

      {/* Tools Tables */}
      <div className="space-y-6">
        {toolsData.tables.map((table, tableIndex) => (
          <div key={table.id} className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-black max-w-2xl mx-auto">
            <div className="bg-gray-100 px-6 py-3 border-b-2 border-black relative rounded-t-lg">
              <button
                onClick={() => {
                  const newTitle = prompt('הכנס שם חדש לטבלה:', table.title)
                  if (newTitle && newTitle.trim()) {
                    handleTableTitleChange(table.id, newTitle.trim())
                  }
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                title="לחץ לשינוי שם הטבלה"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <h3 className="text-lg font-bold text-black text-center">{table.title}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <tbody>
                  {table.rows.slice(1).map((row, rowIndex) => (
                    <tr key={row.id} className="bg-white border-b-2 border-black hover:bg-gray-50">
                      <td className="border-b-2 border-black p-2">
                        <textarea
                          value={row.text}
                          onChange={(e) => handleTextChange(table.id, row.id, e.target.value)}
                          className="w-full h-auto min-h-[24px] bg-transparent text-black text-right resize-none overflow-hidden focus:outline-none font-bold text-base"
                          rows={1}
                          onInput={(e) => {
                            e.currentTarget.style.height = 'auto'
                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 text-center border-b-2 border-black w-16">
                        {table.rows.length > 3 && (
                          <button
                            onClick={() => handleDeleteRow(table.id, row.id)}
                            className="text-red-500 hover:text-red-700 font-bold text-lg"
                          >
                            X
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t-2 border-black rounded-b-lg">
              <button
                onClick={() => handleAddRow(table.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                הוסף שורה לטבלה זו
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
