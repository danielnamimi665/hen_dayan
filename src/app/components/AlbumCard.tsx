'use client'

import { InvoiceData } from '../types/invoice'
import { useState } from 'react'
import Image from 'next/image'

interface AlbumCardProps {
  invoice: InvoiceData
  onView: () => void
  onDelete: () => void
}

export default function AlbumCard({ invoice, onView, onDelete }: AlbumCardProps) {
  const [imageError, setImageError] = useState(false)
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const hebrewMonths = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ]
    
    const day = date.getDate()
    const month = hebrewMonths[date.getMonth()]
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${day} ב${month} ${year}, ${hours}:${minutes}`
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Error loading image in AlbumCard:', invoice.name, invoice.id)
    console.error('Firebase info:', {
      size: invoice.size,
      type: invoice.type,
      downloadURL: invoice.downloadURL
    })
    setImageError(true)
    e.currentTarget.src = '/henlogo.png' // Fallback image
  }

  const imageUrl = imageError ? '/henlogo.png' : invoice.downloadURL

  return (
    <div className="bg-white border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Smaller image container */}
      <div className="w-24 h-24 mx-auto bg-gray-100 relative cursor-pointer rounded-lg" onClick={onView}>
        <Image
          src={imageUrl}
          alt={invoice.name}
          width={96}
          height={96}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
          onError={() => handleImageError}
        />
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
            <span className="text-xs text-gray-500">שגיאה בטעינה</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2">{formatDate(invoice.createdAt)}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onView}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
            >
              פתח
            </button>
            <button
              onClick={onDelete}
              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
            >
              מחק
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
