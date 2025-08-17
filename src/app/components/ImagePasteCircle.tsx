'use client'

import { useRef, useCallback, useState, useEffect } from 'react'

interface ImagePasteCircleProps {
  onImagePaste: (imageData: string) => void
  imagePreview: string | null
}

export default function ImagePasteCircle({ onImagePaste, imagePreview }: ImagePasteCircleProps) {
  const [isDragOver, setIsDragOver] = useState(false)


  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            if (result) {
              onImagePaste(result)
            }
          }
          reader.readAsDataURL(file)
        }
        break
      }
    }
  }, [onImagePaste])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (result) {
            onImagePaste(result)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }, [onImagePaste])

  // Add paste event listener
  const circleRef = useRef<HTMLDivElement>(null)
  
  // Global paste event listener
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      handlePaste(e)
    }
    
    document.addEventListener('paste', handleGlobalPaste)
    return () => {
      document.removeEventListener('paste', handleGlobalPaste)
    }
  }, [handlePaste])

  return (
    <div className="relative">
               <div
           ref={circleRef}
                                                         className={`
                w-72 h-72 sm:w-80 sm:h-80 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full border-4 border-solid
                flex items-center justify-center transition-all duration-200
                ${isDragOver 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : 'border-black'
                }
                ${imagePreview ? 'border-solid border-green-500' : ''}
              `}
           onDragOver={handleDragOver}
           onDragLeave={handleDragLeave}
           onDrop={handleDrop}
           onPaste={(e) => {
             // Handle paste for the div
             const items = e.clipboardData?.items
             if (!items) return

             for (let i = 0; i < items.length; i++) {
               if (items[i].type.indexOf('image') !== -1) {
                 const file = items[i].getAsFile()
                 if (file) {
                   const reader = new FileReader()
                   reader.onload = (e) => {
                     const result = e.target?.result as string
                     if (result) {
                       onImagePaste(result)
                     }
                   }
                   reader.readAsDataURL(file)
                 }
                 break
               }
             }
           }}
         >
                 {imagePreview ? (
           <div className="relative w-full h-full">
             <img
               src={imagePreview}
               alt="תמונה שהועלתה"
               className="w-full h-full rounded-full object-cover"
             />
             <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200">
               <button
                 onClick={() => {
                   const link = document.createElement('a')
                   link.href = imagePreview
                   link.download = 'hen-dayan-image.jpg'
                   link.click()
                 }}
                 className="bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200"
               >
                 שמור תמונה
               </button>
             </div>
           </div>
         ) : (
                                  <img
               src="/henlogo.png"
               alt="חן דיין לוגו"
               className="w-full h-full object-cover rounded-full scale-110"
             />
        )}
      </div>
      
      
    </div>
  )
}
