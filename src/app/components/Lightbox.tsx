'use client'

import { useEffect } from 'react'
import { InvoiceData } from '../types/invoice'

interface LightboxProps {
  invoice: InvoiceData
  onClose: () => void
}

export default function Lightbox({ invoice, onClose }: LightboxProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const hebrewMonths = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ]
    
    const day = date.getDate()
    const month = hebrewMonths[date.getMonth()]
    const year = date.getFullYear()
    const time = date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    return `${day} ב${month} ${year}, ${time}`
  }

  const imageUrl = invoice.blob ? URL.createObjectURL(invoice.blob) : invoice.downloadURL

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl max-h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 z-10"
          aria-label="סגור"
        >
          ×
        </button>
        
        <div className="bg-white rounded-lg p-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-black">{invoice.name}</h3>
            <p className="text-gray-600">{formatDate(invoice.createdAt)}</p>
          </div>
          
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt={invoice.name}
              className="max-w-full max-h-[80vh] object-contain shadow-lg"
            />
          </div>
          
          <div className="text-center mt-4 text-sm text-gray-600">
            גודל: {Math.round(invoice.size / 1024)}KB | 
            מידות: {invoice.width} × {invoice.height}
          </div>
        </div>
      </div>
    </div>
  )
}
