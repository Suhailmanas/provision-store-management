'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProducts, addSale } from '@/app/actions/products'
import { useLanguage } from '@/components/language-provider'
import LoadingScreen from '@/components/loading-screen'

interface Product {
  id: string
  name: string
  unit: string
  current_stock: number
  sellingPrice?: number
}

export default function SalesForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [priceOverride, setPriceOverride] = useState(false)
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    sellingPrice: 0,
    saleDate: new Date().toISOString().split('T')[0],
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

  const selectedProduct = products.find((p) => p.id === formData.productId)
  
  useEffect(() => {
    if (selectedProduct && !priceOverride && selectedProduct.sellingPrice) {
      setFormData(prev => ({ ...prev, sellingPrice: selectedProduct.sellingPrice || 0 }))
    }
  }, [selectedProduct, priceOverride])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.productId) {
        throw new Error(t('sales.selectRequired'))
      }

      if (formData.quantity <= 0) {
        throw new Error(t('sales.quantityRequired'))
      }

      if (formData.sellingPrice <= 0) {
        throw new Error(t('sales.priceRequired'))
      }

      if (formData.quantity > (selectedProduct?.current_stock || 0)) {
        throw new Error(t('sales.stockRequired'))
      }

      await addSale({
        productId: formData.productId,
        quantity: parseInt(formData.quantity.toString()),
        sellingPrice: parseFloat(formData.sellingPrice.toString()),
        saleDate: formData.saleDate,
      })

      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('sales.recordFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {loading && <LoadingScreen message="Recording sale..." />}
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
              {product.name} (Stock: {product.current_stock} {product.unit})
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-900">
            Available: <span className="font-bold">{selectedProduct.current_stock} {selectedProduct.unit}</span>
          </p>
          {selectedProduct.sellingPrice && (
            <p className="text-sm text-blue-900 mt-1">
              Master Price: Rs <span className="font-bold">{selectedProduct.sellingPrice}</span>
            </p>
          )}
        </div>
      )}

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
          <label className="block text-sm font-medium text-gray-900 mb-2">{t('sales.pricePerUnit')}</label>
          <input
            type="number"
            step="0.01"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
            min="0"
            disabled={loading || !priceOverride}
          />
        </div>
      </div>

      {selectedProduct?.sellingPrice && (
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={priceOverride}
              onChange={(e) => setPriceOverride(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
              disabled={loading}
            />
            <span className="ml-2 text-sm font-medium text-gray-900">Override Price</span>
          </label>
        </div>
      )}

      {formData.quantity > 0 && formData.sellingPrice > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{(formData.quantity * formData.sellingPrice).toFixed(2)}
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">{t('common.date')}</label>
        <input
          type="date"
          value={formData.saleDate}
          onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors active:bg-green-800"
      >
        {loading ? t('sales.recording') : t('sales.recordButton')}
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
