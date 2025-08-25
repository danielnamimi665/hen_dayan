'use client'

interface CategoriesProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

// Function to get appropriate icon for each category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'ימי עבודה':
      return '🛠️'
    case 'הוצאות':
      return '💰'
    case 'חשבוניות':
      return '📄'
    case 'לקוחות':
      return '👥'
    case 'תחזוקת כלים':
      return '🔧'
    default:
      return '📋'
  }
}

export default function Categories({ categories, selectedCategory, onSelectCategory }: CategoriesProps) {
  return (
    <>
      {/* Black horizontal line above categories */}
      <div className="w-full h-2 bg-black shadow-2xl"></div>
      
      {/* Categories section */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop: Show all categories as modern squares */}
          <div className="hidden lg:flex space-x-8 space-x-reverse justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`aspect-square bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex flex-col items-center justify-center p-6 transition-all duration-200 transform hover:scale-105 hover:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                  selectedCategory === category 
                    ? 'ring-4 ring-black shadow-xl scale-105' 
                    : 'hover:shadow-xl'
                }`}
              >
                <div className="w-16 h-16 rounded-xl mb-4 flex items-center justify-center bg-gray-100 text-gray-700 mb-3">
                  <span className="text-3xl">{getCategoryIcon(category)}</span>
                </div>
                <span className="text-base font-bold text-center leading-tight text-gray-800">
                  {category}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile: Grid layout for categories as squares */}
          <div className="lg:hidden">
            <div className="grid grid-cols-2 gap-4 py-6 px-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onSelectCategory(category)}
                  className={`aspect-square bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex flex-col items-center justify-center p-4 transition-all duration-200 transform hover:scale-105 hover:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                    selectedCategory === category 
                      ? 'ring-4 ring-black shadow-xl scale-105' 
                      : 'hover:shadow-xl'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center bg-gray-100 text-gray-700">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                  </div>
                  <span className="text-sm font-bold text-center leading-tight text-gray-800">
                    {category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
