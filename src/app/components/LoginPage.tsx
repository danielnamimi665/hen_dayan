'use client'

import { useState, useCallback } from 'react'
import ImagePasteCircle from './ImagePasteCircle'
import LoginModal from './LoginModal'

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [showModal, setShowModal] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImagePaste = useCallback((imageData: string) => {
    setImagePreview(imageData)
  }, [])

  const handleTextClick = () => {
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
  }

  const handleLoginSuccess = () => {
    setShowModal(false)
    onLogin()
  }

  return (
         <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-4" style={{ backgroundImage: 'url(/beckround.jpg)' }}>
      <div className="flex flex-col items-center space-y-12 w-full">
        <div className="mr-1 sm:mr-2 lg:mr-3">
          <ImagePasteCircle 
            onImagePaste={handleImagePaste}
            imagePreview={imagePreview}
          />
        </div>
        
                 <div className="text-center w-full max-w-lg sm:max-w-xl lg:max-w-2xl">
           <button
             onClick={handleTextClick}
             className="bg-white border-2 border-black rounded-2xl px-6 py-3 text-2xl sm:text-3xl font-black text-amber-600 hover:text-amber-700 transition-colors duration-200 cursor-pointer shadow-lg font-sans tracking-wide"
           >
             חן דיין עבודות עפר ופיתוח
           </button>
         </div>
      </div>

      {showModal && (
        <LoginModal
          onClose={handleModalClose}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  )
}
