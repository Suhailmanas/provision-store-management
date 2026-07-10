'use client'

import { useEffect, useState } from 'react'
import { getDashboardStats } from '@/app/actions/analytics'
import { useLanguage } from '@/components/language-provider'
import Navigation from './navigation'
import StatCard from './stat-card'
import QuickActions from './quick-actions'
import LowStockAlert from './low-stock-alert'

const defaultStats = {
  totalProducts: 0,
  todaysSalesQuantity: 0,
  todaysSalesAmount: 0,
  totalInventoryItems: 0,
  lowStockCount: 0,
}

export default function Dashboard() {
  const { t } = useLanguage()
  const [stats, setStats] = useState(defaultStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats()
        setStats(data ?? defaultStats)
      } catch (error) {
        console.error('[v0] Error loading dashboard stats:', error)
        setStats(defaultStats)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 pb-24">
        <div className="bg-[#2563EB] text-white px-4 py-6">
          <h1 className="text-3xl font-poppins font-bold">{t('dashboard.title')}</h1>
          <p className="text-blue-100 mt-1 text-sm">{t('dashboard.subtitle')}</p>
        </div>

        <div className="px-4 py-6 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard
              label={t('dashboard.products')}
              value={stats.totalProducts}
              icon="📦"
              color=""
              loading={loading}
            />
            <StatCard
              label={t('dashboard.totalStock')}
              value={stats.totalInventoryItems}
              icon="📊"
              color=""
              loading={loading}
            />
            <StatCard
              label={t('dashboard.todaysSales')}
              value={stats.todaysSalesQuantity}
              icon="💰"
              color=""
              loading={loading}
            />
            <StatCard
              label={t('dashboard.revenue')}
              value={`Rs ${Math.round(stats.todaysSalesAmount)}`}
              icon="📈"
              color=""
              loading={loading}
            />
          </div>

          {stats.lowStockCount > 0 && <LowStockAlert count={stats.lowStockCount} />}
          <QuickActions />
        </div>
      </div>

      <Navigation />
    </div>
  )
}
