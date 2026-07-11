'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/app/actions/new-products'

interface ProductFormProps {
  categoryId: string
  onSuccess?: () => void
}

export default function ProductForm({ categoryId, onSuccess }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name.trim()) {
        throw new Error('Product name is required')
      }

      await createProduct({
        categoryId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })

      setFormData({ name: '', description: '' })
      onSuccess?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
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

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Whole Milk, Low Fat Milk"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional description"
          rows={2}
          disabled={loading}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
        >
          {loading ? 'Creating...' : 'Add Product'}
        </button>
      </div>
    </form>
  )
}
