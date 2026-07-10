'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/language-provider'

interface LowStockAlertProps {
  count: number
}

export default function LowStockAlert({ count }: LowStockAlertProps) {
  const { t } = useLanguage()

  return (
    <div className="rounded-[12px] border border-amber-300 bg-amber-50 p-4 mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-900">{t('dashboard.lowStockTitle')}</p>
          <p className="mt-1 text-sm text-foreground/80">
            {t('dashboard.lowStockMessage', { count })}
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
        >
          {t('dashboard.viewProducts')}
        </Link>
      </div>
    </div>
  )
}
