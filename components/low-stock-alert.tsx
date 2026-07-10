import Link from 'next/link'

interface LowStockAlertProps {
  count: number
}

export default function LowStockAlert({ count }: LowStockAlertProps) {
  return (
    <Link href="/products?filter=low-stock">
      <div className="bg-yellow-50 border-l-4 border-[#FACC15] p-4 rounded-[12px] mb-6 cursor-pointer hover:bg-yellow-100 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="font-poppins font-semibold text-[#FACC15]">Low Stock Alert</p>
            <p className="text-sm text-slate-700">{count} product(s) have low stock</p>
          </div>
          <span className="text-[#FACC15]">→</span>
        </div>
      </div>
    </Link>
  )
}
