'use client'

import Link from 'next/link'
import { useState } from 'react'
import ProductForm from './product-form'

interface Category {
  id: string
  name: string
  description?: string | null
  color: string
}

interface Product {
  id: string
  name: string
  description?: string | null
  active: boolean
}

interface CategoryDetailProps {
  category: Category
  products: Product[]
}

export default function CategoryDetail({ category, products }: CategoryDetailProps) {
  const [showNewProduct, setShowNewProduct] = useState(false)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/categories" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block">
          ← Back to Categories
        </Link>
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600 mt-1">{category.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">{products.length} products</p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Products</h2>
          <button
            onClick={() => setShowNewProduct(!showNewProduct)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            {showNewProduct ? '✕ Cancel' : '+ New Product'}
          </button>
        </div>

        {showNewProduct && (
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <ProductForm categoryId={category.id} onSuccess={() => setShowNewProduct(false)} />
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No products in this category yet.</p>
            <button
              onClick={() => setShowNewProduct(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Create First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/categories/${category.id}/products/${product.id}/variants`}
              >
                <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-md transition-all cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-800 text-balance">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-3 text-sm text-blue-600 font-medium">
                    View Variants →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
