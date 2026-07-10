'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/app/actions/products'
import { useLanguage } from '@/components/language-provider'
import LoadingScreen from '@/components/loading-screen'

interface ProductFormProps {
  productId?: string
  product?: {
    name: string
    category?: string
    unit: string
    opening_stock: number
    current_stock: number
  }
}

export default function ProductForm({ productId, product }: ProductFormProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: product?.name ?? '',
    category: product?.category ?? '',
    unit: product?.unit ?? 'pieces',
    opening_stock: product?.opening_stock ?? 0,
    current_stock: product?.current_stock ?? 0,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category ?? '',
        unit: product.unit,
        opening_stock: product.opening_stock,
        current_stock: product.current_stock,
      })
    }
  }, [product])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name.trim()) {
        throw new Error(t('products.nameRequired'))
      }

      if (!formData.unit.trim()) {
        throw new Error(t('products.unitRequired'))
      }

      if (productId) {
        await updateProduct(productId, {
          name: formData.name.trim(),
          category: formData.category.trim() || undefined,
          unit: formData.unit.trim(),
          opening_stock: Number(formData.opening_stock),
          current_stock: Number(formData.current_stock),
        })
      } else {
        await createProduct({
          name: formData.name.trim(),
          category: formData.category.trim() || undefined,
          unit: formData.unit.trim(),
          opening_stock: parseInt(formData.opening_stock.toString()) || 0,
        })
      }

      router.push('/products')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(productId ? 'products.updateFailed' : 'products.createFailed')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {loading && (
        <LoadingScreen
          message={t(productId ? 'products.updating' : 'products.creating')}
        />
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">{t('products.name')}</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder={t('products.namePlaceholder')}
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">{t('products.category')}</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder={t('products.categoryPlaceholder')}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">{t('products.unit')}</label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
          >
            <option value="pieces">Pieces</option>
            <option value="kg">Kg</option>
            <option value="liter">Liter</option>
            <option value="dozen">Dozen</option>
            <option value="box">Box</option>
            <option value="packet">Packet</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">{t('products.openingStock')}</label>
          <input
            type="number"
            value={formData.opening_stock}
            onChange={(e) => setFormData({ ...formData, opening_stock: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0"
            min="0"
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">{t('products.currentStock')}</label>
        <input
          type="number"
          value={formData.current_stock}
          onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="0"
          min="0"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors active:bg-green-800"
      >
        {loading
          ? t(productId ? 'products.updating' : 'products.creating')
          : t(productId ? 'products.updateButton' : 'products.createButton')}
      </button>

      <button
        type="button"
        onClick={() => router.push('/products')}
        disabled={loading}
        className="w-full mt-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors"
      >
        Cancel
      </button>
    </form>
    </div>
  )
}
