'use client'

interface CategoriesProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export default function Categories({ categories, selectedCategory, onSelectCategory }: CategoriesProps) {
  return (
    <>
      {/* Black horizontal line above categories */}
      <div className="w-full h-2 bg-black shadow-2xl"></div>
      
      {/* Categories section */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop: Show all categories in one row */}
          <div className="hidden lg:flex space-x-8 space-x-reverse">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`
                  py-4 px-2 text-sm font-medium border-b-4 transition-colors duration-200
                  ${selectedCategory === category
                    ? 'border-black text-black'
                    : 'border-transparent text-black hover:text-black hover:border-black'
                  }
                  focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-transparent
                `}
                aria-current={selectedCategory === category ? 'page' : undefined}
              >
                {category}
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
                  className={`
                    aspect-square bg-white/90 backdrop-blur-sm rounded-xl shadow-lg
                    flex flex-col items-center justify-center p-4
                    transition-all duration-200 transform hover:scale-105
                    ${selectedCategory === category
                      ? 'ring-4 ring-black bg-white'
                      : 'hover:bg-white'
                    }
                    focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                  `}
                  aria-current={selectedCategory === category ? 'page' : undefined}
                >
                  <div className={`
                    w-12 h-12 rounded-lg mb-3 flex items-center justify-center
                    ${selectedCategory === category
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-700'
                    }
                  `}>
                    {/* Icon placeholder - you can add specific icons for each category */}
                    <span className="text-xl">📋</span>
                  </div>
                  <span className={`
                    text-sm font-bold text-center leading-tight
                    ${selectedCategory === category
                      ? 'text-black'
                      : 'text-gray-800'
                    }
                  `}>
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
