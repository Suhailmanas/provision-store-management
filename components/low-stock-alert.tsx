import Link from 'next/link'

interface LowStockAlertProps {
  count: number
}

export default function LowStockAlert({ count }: LowStockAlertProps) {
  return (
    <Link href="/products?filter=low-stock">
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded mb-6 cursor-pointer hover:bg-orange-100 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="font-bold text-orange-900">Low Stock Alert</p>
            <p className="text-sm text-orange-800">{count} product(s) have low stock</p>
          </div>
          <span className="text-orange-600">→</span>
        </div>
      </div>
    </Link>
  )
}
