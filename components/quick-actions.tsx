'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/language-provider'

export default function QuickActions() {
  const { t } = useLanguage()

  return (
    <div className="bg-card rounded-[12px] border border-border p-4 mb-6">
      <h3 className="font-poppins font-semibold text-foreground mb-4">
        {t('dashboard.quickActions')}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/sales/new"
          className="flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white py-3 px-4 rounded-[12px] font-medium transition-colors active:bg-[#991B1B] h-12"
        >
          <span>💵</span>
          <span className="text-sm">{t('dashboard.sale')}</span>
        </Link>
        <Link
          href="/purchases/new"
          className="flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white py-3 px-4 rounded-[12px] font-medium transition-colors active:bg-[#166534] h-12"
        >
          <span>📦</span>
          <span className="text-sm">{t('dashboard.purchase')}</span>
        </Link>
        <Link
          href="/products/new"
          className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 px-4 rounded-[12px] font-medium transition-colors active:bg-[#1E40AF] h-12"
        >
          <span>➕</span>
          <span className="text-sm">{t('dashboard.product')}</span>
        </Link>
        <Link
          href="/daily-close"
          className="flex items-center justify-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white py-3 px-4 rounded-[12px] font-medium transition-colors active:bg-[#92400E] h-12"
        >
          <span>🔒</span>
          <span className="text-sm">{t('dashboard.dailyClose')}</span>
        </Link>
      </div>
    </div>
  )
}
