'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createVariant } from '@/app/actions/variants'

interface VariantFormProps {
  productId: string
  onSuccess?: () => void
}

const UNITS = ['pieces', 'liter', 'kg', 'box', 'packet', 'dozen', 'carton', 'bottle']

export default function VariantForm({ productId, onSuccess }: VariantFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    brand: '',
    packSize: 1,
    unit: 'pieces',
    buyingPrice: 0,
    sellingPrice: 0,
    minimumStock: 5,
    fastMoving: false,
    expiryTracking: false,
    opening_stock: 0,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (formData.packSize < 1) {
        throw new Error('Pack size must be at least 1')
      }
      if (formData.buyingPrice < 0) {
        throw new Error('Buying price cannot be negative')
      }
      if (formData.sellingPrice < 0) {
        throw new Error('Selling price cannot be negative')
      }

      await createVariant({
        productId,
        brand: formData.brand.trim() || undefined,
        packSize: formData.packSize,
        unit: formData.unit,
        buyingPrice: formData.buyingPrice,
        sellingPrice: formData.sellingPrice,
        minimumStock: formData.minimumStock,
        fastMoving: formData.fastMoving,
        expiryTracking: formData.expiryTracking,
        opening_stock: formData.opening_stock,
      })

      setFormData({
        brand: '',
        packSize: 1,
        unit: 'pieces',
        buyingPrice: 0,
        sellingPrice: 0,
        minimumStock: 5,
        fastMoving: false,
        expiryTracking: false,
        opening_stock: 0,
      })
      onSuccess?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create variant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Brand</label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="e.g., Amul, Nestle"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Pack Size</label>
          <input
            type="number"
            value={formData.packSize}
            onChange={(e) => setFormData({ ...formData, packSize: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            min="1"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Unit</label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={loading}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u.charAt(0).toUpperCase() + u.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Opening Stock</label>
          <input
            type="number"
            value={formData.opening_stock}
            onChange={(e) => setFormData({ ...formData, opening_stock: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            min="0"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Buying Price (Rs)</label>
          <input
            type="number"
            value={formData.buyingPrice}
            onChange={(e) => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            step="0.01"
            min="0"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Selling Price (Rs)</label>
          <input
            type="number"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            step="0.01"
            min="0"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Minimum Stock Level</label>
        <input
          type="number"
          value={formData.minimumStock}
          onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) || 5 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          min="1"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.fastMoving}
            onChange={(e) => setFormData({ ...formData, fastMoving: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
            disabled={loading}
          />
          <span className="ml-2 text-sm font-medium text-gray-900">Fast Moving Product</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.expiryTracking}
            onChange={(e) => setFormData({ ...formData, expiryTracking: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
            disabled={loading}
          />
          <span className="ml-2 text-sm font-medium text-gray-900">Track Expiry Dates</span>
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
        >
          {loading ? 'Creating...' : 'Add Variant'}
        </button>
      </div>
    </form>
  )
}
