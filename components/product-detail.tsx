'use client'

import Link from 'next/link'
import { useState } from 'react'
import VariantForm from './variant-form'

interface Product {
  id: string
  name: string
  description?: string | null
  active: boolean
}

interface Variant {
  id: string
  brand?: string | null
  packSize: number
  unit: string
  buyingPrice: number
  sellingPrice: number
  minimumStock: number
  current_stock: number
}

interface ProductDetailProps {
  categoryId: string
  product: Product
  variants: Variant[]
}

export default function ProductDetail({ categoryId, product, variants }: ProductDetailProps) {
  const [showNewVariant, setShowNewVariant] = useState(false)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href={`/categories/${categoryId}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block">
          ← Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
        {product.description && (
          <p className="text-gray-600 mt-1">{product.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">{variants.length} variants</p>
      </div>

      {/* Variants Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Variants</h2>
          <button
            onClick={() => setShowNewVariant(!showNewVariant)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            {showNewVariant ? '✕ Cancel' : '+ New Variant'}
          </button>
        </div>

        {showNewVariant && (
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <VariantForm productId={product.id} onSuccess={() => setShowNewVariant(false)} />
          </div>
        )}

        {variants.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No variants yet. Create one to start tracking inventory.</p>
            <button
              onClick={() => setShowNewVariant(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Create First Variant
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Brand</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pack Size</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Buying Price</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Selling Price</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, idx) => (
                  <tr key={variant.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm text-gray-800">{variant.brand || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{variant.packSize}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{variant.unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right">Rs {variant.buyingPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right">Rs {variant.sellingPrice.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-sm text-right font-semibold ${variant.current_stock < variant.minimumStock ? 'text-red-600' : 'text-green-600'}`}>
                      {variant.current_stock}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/categories/${categoryId}/products/${product.id}/variants/${variant.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
