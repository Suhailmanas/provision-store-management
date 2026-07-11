'use client'

import Link from 'next/link'

interface Category {
  id: string
  name: string
  description?: string | null
  color: string
  active: boolean
}

interface CategoriesGridProps {
  categories: Category[]
}

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No categories yet. Create one to get started!</p>
        <a
          href="/categories/new"
          className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Create First Category
        </a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.id}`}
          className="group"
        >
          <div
            className="p-6 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all cursor-pointer"
            style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                )}
              </div>
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </div>
            <div className="mt-4">
              <button
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={(e) => {
                  e.preventDefault()
                }}
              >
                View Products →
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
