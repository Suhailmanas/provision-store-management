'use client'

import { useEffect, useState } from 'react'
import { getDashboardStats } from '@/app/actions/analytics'
import Navigation from './navigation'
import StatCard from './stat-card'
import QuickActions from './quick-actions'
import LowStockAlert from './low-stock-alert'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    todaysSalesQuantity: 0,
    todaysSalesAmount: 0,
    totalInventoryItems: 0,
    lowStockCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('[v0] Error loading dashboard stats:', error)
        // Keep default stats on error, they're already initialized
        setStats({
          totalProducts: 0,
          todaysSalesQuantity: 0,
          todaysSalesAmount: 0,
          totalInventoryItems: 0,
          lowStockCount: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 pb-24">
        {/* Header */}
        <div className="bg-[#2563EB] text-white px-4 py-6">
          <h1 className="text-3xl font-poppins font-bold">Kirana Store</h1>
          <p className="text-blue-100 mt-1 text-sm">Inventory Management</p>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 max-w-2xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard
              label="Products"
              value={stats.totalProducts}
              icon="📦"
              color=""
              loading={loading}
            />
            <StatCard
              label="Total Stock"
              value={stats.totalInventoryItems}
              icon="📊"
              color=""
              loading={loading}
            />
            <StatCard
              label="Today&apos;s Sales"
              value={stats.todaysSalesQuantity}
              icon="💰"
              color=""
              loading={loading}
            />
            <StatCard
              label="Revenue"
              value={`₹${Math.round(stats.todaysSalesAmount)}`}
              icon="📈"
              color=""
              loading={loading}
            />
          </div>

          {/* Low Stock Alert */}
          {stats.lowStockCount > 0 && <LowStockAlert count={stats.lowStockCount} />}

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  )
}
