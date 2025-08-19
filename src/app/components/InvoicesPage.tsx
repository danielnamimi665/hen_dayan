'use client'

/**
 * InvoicesPage - קטגוריית חשבוניות
 * 
 * שים לב: כדי שהתמונות יסתנכרנו בין מכשירים, יש צורך להגדיר Firebase:
 * 1. צור פרויקט Firebase חדש
 * 2. הפעל Firebase Storage ו-Firestore Database
 * 3. צור קובץ .env.local עם פרטי Firebase
 * 4. עדכן את firebase/config.ts
 * 
 * ללא הגדרת Firebase, התמונות יישמרו רק במכשיר המקומי (IndexedDB)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import AttachPanel from './AttachPanel'
import AlbumGrid from './AlbumGrid'
import { FirebaseStorageService } from '../services/firebaseStorage'
import { InvoiceData, InvoiceWithUpload } from '../types/invoice'

export default function InvoicesPage() {
  // Helper function to generate unique ID
  const generateUUID = () => {
  return `invoice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadErrors, setLoadErrors] = useState<string[]>([])
  const [openMobileGallerySignal, setOpenMobileGallerySignal] = useState(0)

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

  // Load invoices from Firebase (with IndexedDB fallback)
  const loadInvoices = useCallback(async (month: number, year: number, showLoading: boolean = false) => {
    console.log(`=== LOADING INVOICES ===`)
    console.log(`Target month: ${month}, year: ${year}`)
    console.log(`Current selected month: ${selectedMonth}, year: ${selectedYear}`)
    
    if (showLoading) setIsLoading(true)
    setLoadErrors([])

    try {
      console.log(`Loading invoices for month: ${month}, year: ${year}`)
      
      // Check if Firebase is configured first
      const isFirebaseReady = await FirebaseStorageService.isFirebaseConfigured()
      console.log('Firebase ready status:', isFirebaseReady)
      
      if (isFirebaseReady) {
        // Try Firebase first
        console.log('Attempting to load from Firebase...')
        const monthInvoices = await FirebaseStorageService.getInvoicesByMonthYear(month, year)
        console.log(`Successfully loaded ${monthInvoices.length} invoices from Firebase for ${month}/${year}`)
        
        // Remove duplicates based on ID
        const uniqueInvoices = monthInvoices.filter((invoice, index, self) => 
          index === self.findIndex(i => i.id === invoice.id)
        )
        
        console.log(`After removing duplicates: ${uniqueInvoices.length} invoices`)
        console.log('Invoices to be set:', uniqueInvoices.map(inv => ({ id: inv.id, month: inv.month, year: inv.year, name: inv.name })))
        
        // Set invoices directly for the current month/year
        setInvoices(uniqueInvoices)
        setLoadErrors([]) // Clear any errors since loading was successful
      } else {
        console.log('Firebase not configured, using IndexedDB fallback...')
        throw new Error('Firebase not configured')
      }
    } catch (error) {
      console.error('Firebase error, trying IndexedDB fallback:', error)
      
      try {
        // Fallback to IndexedDB
        console.log('Loading from IndexedDB fallback...')
        const { InvoicesDB } = await import('../services/db')
        const monthInvoices = await InvoicesDB.getInvoicesByMonthYear(month, year)
        console.log(`Loaded ${monthInvoices.length} invoices from IndexedDB fallback for ${month}/${year}`)
        
        const convertedInvoices: InvoiceData[] = await Promise.all(monthInvoices.map(async (inv) => {
          let dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
          if (inv.blob) {
            dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : dataUrl)
              reader.readAsDataURL(inv.blob!)
            })
          }
          return {
            id: inv.id,
            name: inv.name,
            createdAt: inv.createdAt,
            type: inv.type,
            size: inv.size,
            width: inv.width || 0,
            height: inv.height || 0,
            month: inv.month || month,
            year: inv.year || year,
            storagePath: '',
            downloadURL: dataUrl
          }
        }))
        
        // Remove duplicates based on ID
        const uniqueInvoices = convertedInvoices.filter((invoice, index, self) => 
          index === self.findIndex(i => i.id === invoice.id)
        )
        
        console.log(`After removing duplicates: ${uniqueInvoices.length} invoices`)
        console.log('Invoices to be set:', uniqueInvoices.map(inv => ({ id: inv.id, month: inv.month, year: inv.year, name: inv.name })))
        
        // Set invoices directly for the current month/year
        setInvoices(uniqueInvoices)
        // No message in production to avoid confusion
      } catch (fallbackError) {
        console.error('Both Firebase and IndexedDB failed:', fallbackError)
        setLoadErrors([`שגיאה בטעינת חשבוניות: ${fallbackError instanceof Error ? fallbackError.message : 'שגיאה לא ידועה'}`])
        setInvoices([]) // Set empty array if loading fails
      }
    } finally {
      setIsLoading(false)
      console.log(`=== LOADING COMPLETED ===`)
    }
  }, [selectedMonth, selectedYear])

  // Handle invoice attachment to Firebase (with IndexedDB fallback)
  const handleInvoiceAttach = useCallback(async (files: File[], month: number, year: number) => {
    try {
      console.log('=== STARTING INVOICE ATTACHMENT ===')
      console.log('Handling attachment of', files.length, 'files for month:', month, 'year:', year)
      console.log('Current selected month:', selectedMonth, 'year:', selectedYear)
      console.log('Upload target month:', month, 'year:', year)
      
      // Clear any previous errors
      setLoadErrors([])
      
      for (const file of files) {
        console.log('--- Processing file:', file.name, '---')
        console.log('File size:', file.size, 'bytes')
        console.log('File type:', file.type)

        try {
          // Check if Firebase is configured first
          const isFirebaseReady = await FirebaseStorageService.isFirebaseConfigured()
          console.log('Firebase ready status:', isFirebaseReady)
          
          if (isFirebaseReady) {
            console.log('Firebase is ready, uploading to Firebase...')
            // Try Firebase first
            const invoiceData = await FirebaseStorageService.uploadImage(file, month, year)
            console.log('[Attach] Uploaded to Firebase:', {
              id: invoiceData.id,
              name: invoiceData.name,
              month: invoiceData.month,
              year: invoiceData.year,
              size: invoiceData.size,
              width: invoiceData.width,
              height: invoiceData.height,
              previewLength: (invoiceData.downloadURL || '').length
            })
            
            // Update the invoices state immediately for better UX
            setInvoices(prev => {
              console.log('Previous invoices count:', prev.length)
              console.log('Previous invoices:', prev.map(inv => ({ id: inv.id, month: inv.month, year: inv.year })))
              
              // Check if this invoice already exists to avoid duplicates
              const exists = prev.some(inv => inv.id === invoiceData.id)
              if (!exists) {
                const newInvoices = [...prev, invoiceData]
                console.log('[Attach] New invoices count:', newInvoices.length)
                console.log('New invoices:', newInvoices.map(inv => ({ id: inv.id, month: inv.month, year: inv.year })))
                return newInvoices
              }
              return prev
            })
            
            // Force re-render for mobile
            setTimeout(() => {
              setInvoices(current => [...current])
              setOpenMobileGallerySignal(prev => prev + 1)
            }, 100)
          } else {
            console.log('Firebase not configured, using IndexedDB fallback...')
            throw new Error('Firebase not configured')
          }
        } catch (firebaseError) {
          console.error('Firebase upload failed, using IndexedDB fallback:', firebaseError)
          
          // Fallback to IndexedDB
          const { InvoicesDB } = await import('../services/db')
          const invoiceData = {
            id: generateUUID(),
            name: file.name,
            createdAt: new Date().toISOString(),
            blob: file,
            type: file.type,
            size: file.size,
            width: 0,
            height: 0,
            month: month,
            year: year
          }
          
          console.log('Saving to IndexedDB:', invoiceData)
          const success = await InvoicesDB.saveInvoice(invoiceData)
          if (success) {
            console.log('Invoice saved to IndexedDB fallback:', invoiceData.name)
            
            // Convert blob to data URL for stable display across devices
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '')
              if (invoiceData.blob) reader.readAsDataURL(invoiceData.blob)
            })

            const fallbackInvoice: InvoiceData = {
              id: invoiceData.id,
              name: invoiceData.name,
              createdAt: invoiceData.createdAt,
              type: invoiceData.type,
              size: invoiceData.size,
              width: invoiceData.width || 0,
              height: invoiceData.height || 0,
              month: invoiceData.month || month,
              year: invoiceData.year || year,
              storagePath: '',
              downloadURL: dataUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
            }
            
            console.log('[Attach] Fallback invoice created (IndexedDB):', { id: fallbackInvoice.id, month: fallbackInvoice.month, year: fallbackInvoice.year, previewLength: (fallbackInvoice.downloadURL || '').length })
            
            // Update the invoices state immediately for better UX
            setInvoices(prev => {
              console.log('Previous invoices count:', prev.length)
              console.log('Previous invoices:', prev.map(inv => ({ id: inv.id, month: inv.month, year: inv.year })))
              
              // Check if this invoice already exists to avoid duplicates
              const exists = prev.some(inv => inv.id === fallbackInvoice.id)
              if (!exists) {
                const newInvoices = [...prev, fallbackInvoice]
                console.log('New invoices count:', newInvoices.length)
                console.log('New invoices:', newInvoices.map(inv => ({ id: inv.id, month: inv.month, year: inv.year })))
                return newInvoices
              }
              return prev
            })
            
            // Force re-render for mobile
            setTimeout(() => {
              setInvoices(current => [...current])
              setOpenMobileGallerySignal(prev => prev + 1)
            }, 100)
          } else {
            throw new Error(`שגיאה בשמירת החשבונית: ${invoiceData.name}`)
          }
        }
      }

      // Show success message
      alert('החשבוניות נוספו בהצלחה!')
      console.log('=== INVOICE ATTACHMENT COMPLETED ===')
      
      // Force immediate update for mobile
      setTimeout(async () => {
        // Reload from server to ensure sync across all devices
        console.log('Reloading invoices to ensure cross-device sync...')
        await loadInvoices(month, year, false)
      }, 200)
      
      // Force immediate re-render
      setTimeout(() => {
        setInvoices(current => [...current])
      }, 100)
      
    } catch (error) {
      console.error('=== ERROR IN INVOICE ATTACHMENT ===')
      console.error('Error in handleInvoiceAttach:', error)
      alert(error instanceof Error ? error.message : 'שגיאה לא ידועה')
    }
  }, [loadInvoices, selectedMonth, selectedYear])

  // Handle invoice deletion: always try Firebase (Firestore + Storage if exists), then fallback to IndexedDB
  const handleDeleteInvoice = useCallback(async (invoice: InvoiceData) => {
    try {
      console.log('[Delete] Request to delete:', { id: invoice.id, name: invoice.name, storagePath: invoice.storagePath })
      // Try Firebase first (deletes Firestore doc and Storage if storagePath exists)
      const firebaseDeleted = await FirebaseStorageService.deleteInvoice(invoice)
      if (firebaseDeleted) {
        setInvoices(prev => prev.filter(inv => inv.id !== invoice.id))
        console.log('[Delete] Removed from UI after Firebase deletion:', invoice.id)
        return
      }

      // Fallback to IndexedDB (local only)
      const { InvoicesDB } = await import('../services/db')
      const indexedDeleted = await InvoicesDB.deleteInvoice(invoice.id)
      if (indexedDeleted) {
        setInvoices(prev => prev.filter(inv => inv.id !== invoice.id))
        console.log('[Delete] Removed from UI after IndexedDB deletion:', invoice.id)
      } else {
        console.error('[Delete] Failed to delete invoice from both Firebase and IndexedDB:', invoice.id)
      }
    } catch (error) {
      console.error('[Delete] Error deleting invoice:', error)
    }
  }, [])

  // Handle month selection
  const handleMonthSelect = (month: number) => {
    console.log(`Month selection changed from ${selectedMonth} to ${month}`)
    setSelectedMonth(month)
    setShowMonthDropdown(false)
    // Load invoices for the new month with current year (show loading spinner for user action)
    loadInvoices(month, selectedYear, true)
  }

  // Handle year selection
  const handleYearSelect = (year: number) => {
    console.log(`Year selection changed from ${selectedYear} to ${year}`)
    setSelectedYear(year)
    setShowYearDropdown(false)
    // Load invoices for the current month with new year (show loading spinner for user action)
    loadInvoices(selectedMonth, year, true)
  }

  // Load invoices when component mounts or month/year changes
  useEffect(() => {
    console.log('Component mounted or month/year changed, loading invoices...')
    // Only load invoices if we have a valid month/year selection
    if (selectedMonth && selectedYear) {
      // Initial load: don't show spinner
      loadInvoices(selectedMonth, selectedYear, false)
    }
  }, [loadInvoices, selectedMonth, selectedYear])
  
  // Force re-render when invoices change
  useEffect(() => {
    console.log('Invoices state updated, count:', invoices.length)
    
    // Force immediate re-render for mobile
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
    if (isMobile) {
      setTimeout(() => {
        setInvoices(current => [...current])
      }, 50)
    }
  }, [invoices])



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
             <h1 className="text-4xl font-bold text-black text-center lg:text-4xl lg:mb-0 text-3xl mb-0">חשבוניות</h1>
           </div>
         </div>
        
        {/* Month/Year Selectors */}
        <div className="flex justify-center gap-4 mb-6">
          {/* Month Dropdown */}
          <div className="relative" ref={monthDropdownRef}>
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              onTouchEnd={(e) => { e.preventDefault(); setShowMonthDropdown(!showMonthDropdown) }}
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
                    onTouchEnd={(e) => { e.preventDefault(); handleMonthSelect(index + 1) }}
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
              onTouchEnd={(e) => { e.preventDefault(); setShowYearDropdown(!showYearDropdown) }}
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
                    onTouchEnd={(e) => { e.preventDefault(); handleYearSelect(year) }}
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

      {/* Attach Panel */}
      <AttachPanel
        onAttach={handleInvoiceAttach}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {/* Album Grid */}
      <div className="mt-8" key={`album-${invoices.length}`}>
        <AlbumGrid
          invoices={invoices}
          isLoading={isLoading}
          loadErrors={loadErrors}
          onDeleteInvoice={handleDeleteInvoice}
          openMobileGallerySignal={openMobileGallerySignal}
        />
      </div>
    </div>
  )
}
