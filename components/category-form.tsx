'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory } from '@/app/actions/categories'

const COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
]

export default function CategoryForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name.trim()) {
        throw new Error('Category name is required')
      }

      await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
      })

      router.push('/categories')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">Category Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Dairy, Beverages, Snacks"
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional description"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-3">Category Color</label>
        <div className="grid grid-cols-4 gap-3">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-12 h-12 rounded-lg border-2 transition-all ${
                formData.color === color ? 'border-gray-900' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              disabled={loading}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Creating...' : 'Create Category'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/categories')}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
