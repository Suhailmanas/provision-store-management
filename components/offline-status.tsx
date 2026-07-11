'use client'

import { useEffect, useState } from 'react'
import { isOnline, onOnline, onOffline } from '@/lib/offline'
import { useLanguage } from '@/components/language-provider'

export default function OfflineStatus() {
  const [online, setOnline] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
    setOnline(isOnline())

    const offlineUnsubscribe = onOffline(() => setOnline(false))
    const onlineUnsubscribe = onOnline(() => setOnline(true))

    return () => {
      offlineUnsubscribe()
      onlineUnsubscribe()
    }
  }, [])

  if (!mounted || online) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white py-2 px-4 flex items-center justify-center gap-2 z-50">
      <span className="animate-pulse">●</span>
      <span className="text-sm font-medium">{t('offline.message')}</span>
    </div>
  )
}
