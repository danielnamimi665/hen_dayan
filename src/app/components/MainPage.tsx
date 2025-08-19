'use client'

import { useEffect, useState } from 'react'
import Header from './Header'
import Categories from './Categories'
import ContentArea from './ContentArea'

interface MainPageProps {
  onLogout: () => void
}

export default function MainPage({ onLogout }: MainPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('ימי עבודה')

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

  return (
    <div className="min-h-screen" style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
      <Header onLogout={onLogout} />
      <Categories 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <ContentArea selectedCategory={selectedCategory} />
    </div>
  )
}
