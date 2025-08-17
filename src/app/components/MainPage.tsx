'use client'

import { useState } from 'react'
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

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'url(/homepage.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
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
