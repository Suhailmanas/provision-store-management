'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProducts, addPurchase } from '@/app/actions/products'
import { useLanguage } from '@/components/language-provider'
import LoadingScreen from '@/components/loading-screen'

interface Product {
  id: string
  name: string
  unit: string
}

export default function PurchasesForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    cost: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const data = await getProducts()
      setProducts(data as Product[])
    } catch (err) {
      console.error('Error loading products:', err)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.productId) {
        throw new Error(t('purchases.selectRequired'))
      }

      if (formData.quantity <= 0) {
        throw new Error(t('purchases.quantityRequired'))
      }

      if (formData.cost <= 0) {
        throw new Error(t('purchases.costRequired'))
      }

      await addPurchase({
        productId: formData.productId,
        quantity: parseInt(formData.quantity.toString()),
        cost: parseFloat(formData.cost.toString()),
        purchaseDate: formData.purchaseDate,
      })

      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('purchases.recordFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {loading && <LoadingScreen message="Recording purchase..." />}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">{t('common.product')}</label>
        <select
          value={formData.productId}
          onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
          disabled={loading}
        >
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">{t('common.quantity')}</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0"
            min="0"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">{t('purchases.costPerUnit')}</label>
          <input
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
            min="0"
            disabled={loading}
          />
        </div>
      </div>

      {formData.quantity > 0 && formData.cost > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-gray-600">Total Cost</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹{(formData.quantity * formData.cost).toFixed(2)}
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">{t('common.date')}</label>
        <input
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors active:bg-green-800"
      >
        {loading ? t('purchases.recording') : t('purchases.recordButton')}
      </button>

      <button
        type="button"
        onClick={() => router.back()}
        disabled={loading}
        className="w-full mt-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors"
      >
        Cancel
      </button>
    </form>
    </div>
  )
}
