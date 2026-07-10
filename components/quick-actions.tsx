'use client'

import Link from 'next/link'

export default function QuickActions() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/sales/new"
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors active:bg-green-800"
        >
          <span>💵</span>
          <span>Record Sale</span>
        </Link>
        <Link
          href="/purchases/new"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors active:bg-blue-800"
        >
          <span>📦</span>
          <span>Add Purchase</span>
        </Link>
        <Link
          href="/products/new"
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors active:bg-purple-800"
        >
          <span>➕</span>
          <span>New Product</span>
        </Link>
        <Link
          href="/daily-close"
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors active:bg-orange-800"
        >
          <span>🔒</span>
          <span>Daily Close</span>
        </Link>
      </div>
    </div>
  )
}
