'use client'

import { useState, useRef, useCallback } from 'react'
import { ImageProcessor } from '../services/imageUtils'

interface AttachPanelProps {
  onAttach: (files: File[], month: number, year: number) => void
  selectedMonth: number
  selectedYear: number
}

export default function AttachPanel({ onAttach, selectedMonth, selectedYear }: AttachPanelProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const lastPressRef = useRef<number>(0)

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

  const HEBREW_MONTHS = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ]

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return
    
    const newFiles = Array.from(files)
    setSelectedFiles(prev => [...prev, ...newFiles])
    setError('')
  }, [])

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleAttach = async () => {
    if (selectedFiles.length === 0) return

    setIsProcessing(true)
    setError('')

    try {
      const processedFiles: File[] = []

      for (const file of selectedFiles) {
        try {
          // Validate file before processing
          if (!file || file.size === 0) {
            console.error('Invalid file:', file?.name)
            throw new Error(`קובץ לא תקין: ${file?.name || 'לא ידוע'}`)
          }
          
          if (!file.type.startsWith('image/')) {
            console.error('File is not an image:', file.name, file.type)
            throw new Error(`הקובץ אינו תמונה: ${file.name}`)
          }

          console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type)

          // Process image
          const processed = await ImageProcessor.processImage(file)
          
          if (!processed || !processed.blob || processed.blob.size === 0) {
            console.error('Processing failed for file:', file.name)
            throw new Error(`עיבוד הקובץ נכשל: ${file.name}`)
          }

          // Create new file with processed data
          const newFile = new File([processed.blob], file.name, {
            type: processed.blob.type,
            lastModified: Date.now()
          })

          if (newFile.size === 0) {
            console.error('Generated file is empty:', file.name)
            throw new Error(`הקובץ שנוצר ריק: ${file.name}`)
          }

          console.log('File processed successfully:', file.name, 'New size:', newFile.size)
          processedFiles.push(newFile)

        } catch (processError) {
          console.error('Error processing file:', file.name, processError)
          
          // Try to use original file as fallback if it's a valid image
          if (file && file.size > 0 && file.type.startsWith('image/')) {
            console.log('Using original file as fallback:', file.name)
            processedFiles.push(file)
          } else {
            throw new Error(`שגיאה בעיבוד הקובץ ${file.name}: ${processError instanceof Error ? processError.message : 'שגיאה לא ידועה'}`)
          }
        }
      }

      if (processedFiles.length === 0) {
        throw new Error('לא ניתן לעבד אף קובץ')
      }

      console.log('Successfully processed files:', processedFiles.length)

      // Clear selected files
      setSelectedFiles([])
      
      // Reset input values
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (galleryInputRef.current) galleryInputRef.current.value = ''

      // Pass processed files to parent component
      onAttach(processedFiles, selectedMonth, selectedYear)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      console.error('Upload error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Single-tap helper to avoid double-fire on mobile (touch + click)
  const singlePress = (action: () => void) => (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const now = Date.now()
    if (now - lastPressRef.current < 300) return
    lastPressRef.current = now
    action()
  }

  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white/90 rounded-2xl shadow-lg p-6 border-2 border-black max-w-md w-full">
        <h2 className="text-2xl font-bold text-black mb-4 text-center">צרף חשבונית</h2>
        
        {/* Selected Month/Year Display */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <div className="text-blue-800 text-sm font-medium">
            חודש: {HEBREW_MONTHS[selectedMonth - 1]} | שנה: {selectedYear}
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-xl">
            <div className="text-red-700 text-sm text-center">{error}</div>
          </div>
        )}
        
        {/* Mobile Buttons */}
        {isMobile && (
          <div className="flex flex-col gap-3 mb-4">
            <button
              onClick={singlePress(() => galleryInputRef.current?.click())}
              onTouchEnd={singlePress(() => galleryInputRef.current?.click())}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              🖼️ ספריית התמונות
            </button>
          </div>
        )}
        
        {/* Desktop Button */}
        {!isMobile && (
          <div className="mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors w-full"
            >
              📁 בחר קובץ
            </button>
          </div>
        )}
        
        {/* Hidden Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        {/* צילום תמונה הוסר לפי דרישת הלקוח */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        {/* Preview Queue */}
        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black mb-2">קבצים שנבחרו:</h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-xl">
                  <span className="text-black text-sm truncate">{file.name}</span>
                  <button
                    onClick={singlePress(() => removeFile(index))}
                    onTouchEnd={singlePress(() => removeFile(index))}
                    className="text-red-600 hover:text-red-800 text-lg font-bold flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Attach Button */}
        <button
          onClick={singlePress(handleAttach)}
          onTouchEnd={singlePress(handleAttach)}
          disabled={selectedFiles.length === 0 || isProcessing}
          className="bg-orange-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-full"
        >
          {isProcessing ? 'מעבד...' : 'צרף'}
        </button>
      </div>
    </div>
  )
}
