'use client'

import type { ReactNode } from 'react'
import Navigation from '@/components/navigation'
import { useLanguage } from '@/components/language-provider'

type PageShellProps = {
  titleKey: string
  subtitleKey: string
  children: ReactNode
}

export default function PageShell({ titleKey, subtitleKey, children }: PageShellProps) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 pb-24">
        <div className="bg-green-600 text-white px-4 py-6">
          <h1 className="text-2xl font-bold">{t(titleKey)}</h1>
          <p className="text-green-100 mt-1">{t(subtitleKey)}</p>
        </div>

        <div className="px-4 py-6 max-w-2xl mx-auto">{children}</div>
      </div>

      <Navigation />
    </div>
  )
}
