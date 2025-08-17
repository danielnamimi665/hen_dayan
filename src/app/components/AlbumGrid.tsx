'use client'

import { useState } from 'react'
import Image from 'next/image'
import { InvoiceData } from '../types/invoice'
import AlbumCard from './AlbumCard'

interface AlbumGridProps {
  invoices: InvoiceData[]
  isLoading: boolean
  loadErrors: string[]
  onDeleteInvoice: (invoice: InvoiceData) => void
}

export default function AlbumGrid({ 
  invoices, 
  isLoading, 
  loadErrors, 
  onDeleteInvoice 
}: AlbumGridProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null)
  const [showMobileGallery, setShowMobileGallery] = useState(false)
  
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

  const handleDelete = (invoice: InvoiceData) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק חשבונית זו?')) {
      onDeleteInvoice(invoice)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-white text-lg">טוען...</div>
      </div>
    )
  }

  if (loadErrors.length > 0) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        {loadErrors.map((error, index) => (
          <div key={index}>{error}</div>
        ))}
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <div className="text-4xl mb-2">📁</div>
            <div className="text-sm">אין חשבוניות באלבום זה</div>
            <div className="text-xs mt-2 text-gray-400">העלה תמונה כדי להתחיל</div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="text-center text-gray-500 text-sm mt-4">
          <p>לחץ על &quot;צרף חשבונית&quot; למעלה כדי להוסיף תמונות לאלבום</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mobile view with first image and scrollable gallery */}
      {isMobile ? (
        <div>
          <div className="mb-6">
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold text-white">לצפייה באלבום החשבוניות</h3>
            </div>
            <div 
              className="w-48 h-48 mx-auto bg-gray-100 relative cursor-pointer rounded-lg overflow-hidden border-2 border-gray-300"
              onClick={() => setShowMobileGallery(true)}
            >
                             <Image
                 src={invoices[0].downloadURL}
                 alt={invoices[0].name}
                 width={192}
                 height={192}
                 className="w-full h-full object-cover hover:scale-105 transition-transform"
                 onError={() => {
                   console.error('Error loading first image:', invoices[0].name)
                 }}
               />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center py-2 text-sm">
                {invoices.length} חשבוניות
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop view - grid layout */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {invoices.map((invoice) => (
            <AlbumCard
              key={invoice.id}
              invoice={invoice}
              onDelete={() => handleDelete(invoice)}
              onView={() => setSelectedInvoice(invoice)}
            />
          ))}
        </div>
      )}

      {/* Mobile Gallery Modal */}
      {showMobileGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-white p-4 flex justify-between items-center rounded-lg">
            <h3 className="text-lg font-bold text-black">אלבום חשבוניות</h3>
            <button
              onClick={() => setShowMobileGallery(false)}
              className="text-black text-2xl font-bold hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          {/* Scrollable Gallery */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {new Date(invoice.createdAt).toLocaleDateString('he-IL')}
                    </span>
                    <button
                      onClick={() => handleDelete(invoice)}
                      className="text-red-600 hover:text-red-800 text-lg font-bold"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="text-center">
                                       <Image
                     src={invoice.downloadURL}
                     alt={invoice.name}
                     width={400}
                     height={300}
                     className="w-full max-w-md mx-auto rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                     onClick={() => setSelectedInvoice(invoice)}
                     onError={() => {
                       console.error('Error loading image in gallery:', invoice.name)
                     }}
                   />
                    <p className="text-sm text-gray-600 mt-2">{invoice.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for individual images */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 z-10"
            >
              ×
            </button>
            <Image
              src={selectedInvoice.downloadURL}
              alt={selectedInvoice.name}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              onError={() => {
                console.error('Error loading image in lightbox:', selectedInvoice.name)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
