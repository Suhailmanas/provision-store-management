'use client'

import { useEffect, useState } from 'react'
import { getTodaysSales, getTodaysPurchases, getMonthlyAnalytics } from '@/app/actions/analytics'
import { getLowStockProducts, getExpiryAlerts, getPurchaseSuggestions } from '@/app/actions/products'
import { useLanguage } from '@/components/language-provider'
import Navigation from './navigation'
import StatCard from './stat-card'
import QuickActions from './quick-actions'

interface DashboardData {
  todaysSales: { totalAmount: number; quantity: number; count: number }
  todaysPurchases: { totalCost: number; quantity: number; count: number }
  monthlyData: { sales: { totalAmount: number; quantity: number }; purchases: { totalCost: number; quantity: number }; profit: number }
  lowStockProducts: any[]
  expiryAlerts: any[]
  purchaseSuggestions: any[]
}

const defaultData: DashboardData = {
  todaysSales: { totalAmount: 0, quantity: 0, count: 0 },
  todaysPurchases: { totalCost: 0, quantity: 0, count: 0 },
  monthlyData: { sales: { totalAmount: 0, quantity: 0 }, purchases: { totalCost: 0, quantity: 0 }, profit: 0 },
  lowStockProducts: [],
  expiryAlerts: [],
  purchaseSuggestions: [],
}

export default function Dashboard() {
  const { t } = useLanguage()
  const [data, setData] = useState<DashboardData>(defaultData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const today = new Date()
        const month = today.getMonth() + 1
        const year = today.getFullYear()

        const [sales, purchases, monthly, lowStock, expiry, suggestions] = await Promise.all([
          getTodaysSales(),
          getTodaysPurchases(),
          getMonthlyAnalytics(year, month),
          getLowStockProducts(),
          getExpiryAlerts(),
          getPurchaseSuggestions(),
        ])

        setData({
          todaysSales: sales || { totalAmount: 0, quantity: 0, count: 0 },
          todaysPurchases: purchases || { totalCost: 0, quantity: 0, count: 0 },
          monthlyData: monthly || { sales: { totalAmount: 0, quantity: 0 }, purchases: { totalCost: 0, quantity: 0 }, profit: 0 },
          lowStockProducts: lowStock || [],
          expiryAlerts: expiry || [],
          purchaseSuggestions: suggestions || [],
        })
      } catch (error) {
        console.error('[v0] Error loading dashboard:', error)
        setData(defaultData)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 pb-24">
        <div className="bg-blue-600 text-white px-4 py-6">
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-blue-100 mt-1 text-sm">{t('dashboard.subtitle')}</p>
        </div>

        <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
          {/* Today's Metrics */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">{t('dashboard.performance')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label={t('dashboard.salesAmount')}
                value={`Rs ${data.todaysSales.totalAmount.toFixed(0)}`}
                icon="💰"
                loading={loading}
              />
              <StatCard
                label={t('dashboard.salesCount')}
                value={data.todaysSales.count}
                icon="🛒"
                loading={loading}
              />
              <StatCard
                label={t('dashboard.purchaseAmount')}
                value={`Rs ${data.todaysPurchases.totalCost.toFixed(0)}`}
                icon="📦"
                loading={loading}
              />
              <StatCard
                label={t('dashboard.purchaseCount')}
                value={data.todaysPurchases.count}
                icon="📥"
                loading={loading}
              />
            </div>
          </div>

          {/* Monthly Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">{t('dashboard.monthlySummary')}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">{t('dashboard.sales')}</p>
                <p className="text-2xl font-bold text-green-600">Rs {data.monthlyData.sales.totalAmount.toFixed(0)}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">{t('dashboard.purchases')}</p>
                <p className="text-2xl font-bold text-blue-600">Rs {data.monthlyData.purchases.totalCost.toFixed(0)}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">{t('dashboard.profit')}</p>
                <p className={`text-2xl font-bold ${data.monthlyData.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  Rs {data.monthlyData.profit.toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {(data.lowStockProducts.length > 0 || data.expiryAlerts.length > 0) && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800">{t('dashboard.alerts')}</h2>
              {data.lowStockProducts.length > 0 && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-800 mb-2">{t('dashboard.lowStockCount', { count: data.lowStockProducts.length })}</p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {data.lowStockProducts.slice(0, 5).map((p) => (
                      <li key={p.variantId}>{p.name} — {p.variantName}: {p.currentStock} ({t('dashboard.recommendedStock', { value: p.minimumStock })})</li>
                    ))}
                    {data.lowStockProducts.length > 5 && <li>{t('dashboard.andMore', { count: data.lowStockProducts.length - 5 })}</li>}
                  </ul>
                </div>
              )}
              {data.expiryAlerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-semibold text-red-800 mb-2">{t('dashboard.expiryAlerts', { count: data.expiryAlerts.length })}</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {data.expiryAlerts.slice(0, 5).map((e) => (
                      <li key={e.id}>{e.productName} ({e.batchNumber}): {e.daysUntilExpiry} {t('common.days')}</li>
                    ))}
                    {data.expiryAlerts.length > 5 && <li>{t('dashboard.andMore', { count: data.expiryAlerts.length - 5 })}</li>}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Purchase Suggestions */}
          {data.purchaseSuggestions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800">{t('dashboard.productsToBuy', { count: data.purchaseSuggestions.length })}</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                {data.purchaseSuggestions.slice(0, 5).map((s) => (
                  <div key={s.productId} className="text-sm text-blue-700 flex justify-between">
                    <span>{s.name} — {s.variantName}</span>
                    <span>{s.suggestedQuantity} {t('common.units')} (Rs {s.estimatedCost.toFixed(0)})</span>
                  </div>
                ))}
                {data.purchaseSuggestions.length > 5 && <p className="text-sm text-blue-700">{t('dashboard.andMore', { count: data.purchaseSuggestions.length - 5 })}</p>}
              </div>
            </div>
          )}

          <QuickActions />
        </div>
      </div>

      <Navigation />
    </div>
  )
}
