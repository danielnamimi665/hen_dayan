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

          {/* Mobile: Horizontal scrollable categories */}
          <div className="lg:hidden overflow-x-auto scrollbar-hide">
            <div className="flex space-x-6 space-x-reverse min-w-max py-4 px-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onSelectCategory(category)}
                  className={`
                    py-2 px-4 text-sm font-bold whitespace-nowrap rounded-lg transition-colors duration-200
                    ${selectedCategory === category
                      ? 'bg-white text-black border-2 border-black'
                      : 'text-black hover:text-black hover:bg-white hover:text-black'
                    }
                    focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                  `}
                  aria-current={selectedCategory === category ? 'page' : undefined}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Scroll indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </>
  )
}
