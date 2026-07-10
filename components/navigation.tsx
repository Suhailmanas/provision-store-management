'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/components/language-provider'

export default function Navigation() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-sm">
      <div className="flex justify-around max-w-2xl mx-auto">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-center transition-colors ${
            pathname === '/'
              ? 'text-[#2563EB] border-t-2 border-[#2563EB]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="text-2xl mb-1">📊</span>
          <span className="text-xs font-medium">{t('nav.dashboard')}</span>
        </Link>

        <Link
          href="/products"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-center transition-colors ${
            isActive('/products')
              ? 'text-[#2563EB] border-t-2 border-[#2563EB]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="text-2xl mb-1">📦</span>
          <span className="text-xs font-medium">{t('nav.products')}</span>
        </Link>

        <Link
          href="/sales/new"
          className="flex-1 flex flex-col items-center justify-center py-3 px-2 text-center transition-colors"
        >
          <span className="text-3xl mb-1">➕</span>
          <span className="text-xs font-medium text-[#DC2626]">{t('nav.addSale')}</span>
        </Link>

        <Link
          href="/purchases"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-center transition-colors ${
            isActive('/purchases')
              ? 'text-[#2563EB] border-t-2 border-[#2563EB]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="text-2xl mb-1">📥</span>
          <span className="text-xs font-medium">{t('nav.purchases')}</span>
        </Link>

        <Link
          href="/reports"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-center transition-colors ${
            isActive('/reports')
              ? 'text-[#2563EB] border-t-2 border-[#2563EB]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="text-2xl mb-1">📈</span>
          <span className="text-xs font-medium">{t('nav.reports')}</span>
        </Link>
      </div>
    </nav>
  )
}
