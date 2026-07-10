'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProducts } from '@/app/actions/products'
import { closeDay } from '@/app/actions/daily-close'

interface Product {
  id: string
  name: string
  unit: string
  current_stock: number
}

export default function DailyCloseForm() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [closingStocks, setClosingStocks] = useState<Record<string, number>>({})

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const data = await getProducts()
      setProducts(data as Product[])
      // Initialize closing stocks with current stock
      const initialStocks: Record<string, number> = {}
      data.forEach((p: Product) => {
        initialStocks[p.id] = p.current_stock
      })
      setClosingStocks(initialStocks)
    } catch (err) {
      console.error('Error loading products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const today = new Date()
      const result = await closeDay(today)

      if (result) {
        router.push('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close day')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No products to close</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-4">
              Close inventory for <span className="font-bold">{new Date().toDateString()}</span>
            </p>

            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Current Stock: <span className="font-bold">{product.current_stock}</span> {product.unit}
                  </p>
                  <input
                    type="number"
                    value={closingStocks[product.id] || 0}
                    onChange={(e) =>
                      setClosingStocks({
                        ...closingStocks,
                        [product.id]: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                    placeholder="Closing Stock"
                    min="0"
                    disabled={submitting}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-900">
              ⚠️ Daily close will lock today&apos;s inventory. Tomorrow&apos;s opening stock will be set to today&apos;s closing stock.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors active:bg-green-800"
          >
            {submitting ? 'Closing...' : 'Complete Daily Close'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </>
      )}
    </form>
  )
}
