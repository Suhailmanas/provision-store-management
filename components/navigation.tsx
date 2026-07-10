'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around max-w-2xl mx-auto">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-center transition-colors ${
            pathname === '/'
              ? 'text-green-600 border-t-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span className="text-2xl mb-1">📊</span>
          <span className="text-xs font-medium">Dashboard</span>
        </Link>

        <Link
          href="/products"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-center transition-colors ${
            isActive('/products')
              ? 'text-green-600 border-t-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span className="text-2xl mb-1">📦</span>
          <span className="text-xs font-medium">Products</span>
        </Link>

        <Link
          href="/sales/new"
          className="flex-1 flex flex-col items-center justify-center py-3 px-2 text-center transition-colors"
        >
          <span className="text-3xl mb-1">➕</span>
          <span className="text-xs font-medium text-green-600">Add Sale</span>
        </Link>

        <Link
          href="/purchases"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-center transition-colors ${
            isActive('/purchases')
              ? 'text-green-600 border-t-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span className="text-2xl mb-1">📥</span>
          <span className="text-xs font-medium">Purchases</span>
        </Link>

        <Link
          href="/reports"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-center transition-colors ${
            isActive('/reports')
              ? 'text-green-600 border-t-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span className="text-2xl mb-1">📈</span>
          <span className="text-xs font-medium">Reports</span>
        </Link>
      </div>
    </nav>
  )
}
