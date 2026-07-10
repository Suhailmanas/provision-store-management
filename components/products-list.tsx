'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProducts, deleteProduct } from '@/app/actions/products'

interface Product {
  id: string
  name: string
  category?: string
  unit: string
  current_stock: number
  opening_stock: number
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data as Product[])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await deleteProduct(id)
      setProducts(products.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockProducts = filteredProducts.filter((p) => p.current_stock < 10)
  const normalProducts = filteredProducts.filter((p) => p.current_stock >= 10)

  return (
    <div>
      {/* Add Product Button */}
      <Link
        href="/products/new"
        className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg mb-4 text-center transition-colors active:bg-green-800"
      >
        + Add New Product
      </Link>

      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
          <Link href="/products/new" className="text-green-600 font-medium mt-2 block">
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-orange-900 mb-3">Low Stock Alert ({lowStockProducts.length})</h3>
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white p-3 rounded border border-orange-100 flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-orange-600">
                        Stock: {product.current_stock} {product.unit}
                      </p>
                    </div>
                    <Link
                      href={`/products/${product.id}`}
                      className="ml-2 text-green-600 font-medium"
                    >
                      →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Normal Stock Products */}
          {normalProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
            >
              <div className="flex-1">
                <p className="font-bold text-gray-900">{product.name}</p>
                {product.category && (
                  <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                )}
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-gray-600">
                    Stock: <span className="font-bold text-green-600">{product.current_stock}</span>
                  </span>
                  <span className="text-gray-600">{product.unit}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-2">
                <Link
                  href={`/products/${product.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit"
                >
                  ✏️
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
