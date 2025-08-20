'use client'

import { useEffect, useState } from 'react'
import Header from './Header'
import Categories from './Categories'
import ContentArea from './ContentArea'

interface MainPageProps {
  onLogout: () => void
}

export default function MainPage({ onLogout }: MainPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCategories, setShowCategories] = useState(true)

  const categories = [
    'ימי עבודה',
    'חשבוניות', 
    'הוצאות',
    'טיפול כלים',
    'חזרה ללקוחות'
  ]

  // Mobile-only background override: use beckround.jpg on small screens
  const [bgUrl, setBgUrl] = useState<string>('/homepage.jpg')
  useEffect(() => {
    try {
      if (window.matchMedia && window.matchMedia('(max-width: 767px)').matches) {
        setBgUrl('/beckround.jpg')
      }
    } catch {
      /* no-op */
    }
  }, [])

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setShowCategories(false)
  }

  const handleBackToCategories = () => {
    setShowCategories(true)
    setSelectedCategory(null)
  }

  return (
    <div className="min-h-screen" style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
      <Header onLogout={onLogout} />
      
      {showCategories ? (
        <>
          <Categories 
            categories={categories}
            selectedCategory={selectedCategory || ''}
            onSelectCategory={handleCategorySelect}
          />
        </>
      ) : (
        <div className="min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Back button */}
            <div className="mb-6">
              <button
                onClick={handleBackToCategories}
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-white/90 hover:bg-white rounded-lg transition-colors duration-200 shadow-lg border-2 border-black"
              >
                <span className="text-lg">←</span>
                <span className="font-medium">חזור לקטגוריות</span>
              </button>
            </div>
            
            {/* Content area */}
            <ContentArea selectedCategory={selectedCategory || ''} />
          </div>
        </div>
      )}
    </div>
  )
}
