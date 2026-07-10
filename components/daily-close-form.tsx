'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProducts } from '@/app/actions/products'
import { closeDay, getDailyCloseForDate } from '@/app/actions/daily-close'
import { useLanguage } from '@/components/language-provider'
import LoadingScreen from '@/components/loading-screen'

interface Product {
  id: string
  name: string
  unit: string
  current_stock: number
}

export default function DailyCloseForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [closingStocks, setClosingStocks] = useState<Record<string, number>>({})
  const [alreadyClosedProductIds, setAlreadyClosedProductIds] = useState<Set<string>>(new Set())
  const [unlockedProductIds, setUnlockedProductIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const [productData, existingCloseData] = await Promise.all([
        getProducts(),
        getDailyCloseForDate(new Date()),
      ])

      const todaysCloses = new Map(
        existingCloseData.map((close) => [close.productId, close.closing_stock])
      )
      const initialStocks: Record<string, number> = {}
      ;(productData as Product[]).forEach((p) => {
        initialStocks[p.id] = todaysCloses.get(p.id) ?? p.current_stock
      })

      setProducts(productData as Product[])
      setClosingStocks(initialStocks)
      setAlreadyClosedProductIds(new Set(existingCloseData.map((close) => close.productId)))
      setUnlockedProductIds(new Set())
    } catch (err) {
      console.error('Error loading products:', err)
      setError(t('dailyClose.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const today = new Date()
      const result = await closeDay(today, closingStocks)

      if (result) {
        router.push('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dailyClose.closeFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      {submitting && <LoadingScreen message={t('dailyClose.closing')} />}
      <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">{t('dailyClose.noProducts')}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-4">
              {t('dailyClose.forDate', { date: new Date().toDateString() })}
            </p>
            {alreadyClosedProductIds.size > 0 && (
              <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
                {t('dailyClose.updateNotice')}
              </p>
            )}

            <div className="space-y-4">
              {products.map((product) => {
                const closingStock = closingStocks[product.id] ?? 0
                const difference = closingStock - product.current_stock
                const alreadyClosed = alreadyClosedProductIds.has(product.id)
                const isUnlocked = unlockedProductIds.has(product.id)
                const isLocked = alreadyClosed && !isUnlocked

                return (
                  <div key={product.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {alreadyClosed && (
                          <p className="text-xs font-semibold text-blue-700">
                            {isLocked
                              ? t('dailyClose.lockedToday')
                              : t('dailyClose.correctionUnlocked')}
                          </p>
                        )}
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          difference === 0
                            ? 'bg-green-50 text-green-700'
                            : 'bg-orange-50 text-orange-700'
                        }`}
                      >
                        {t('dailyClose.difference')}: {difference > 0 ? '+' : ''}{difference}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {t('dailyClose.expectedStock')}: <span className="font-bold">{product.current_stock}</span> {product.unit}
                    </p>
                    <input
                      type="number"
                      value={closingStock}
                      onChange={(e) =>
                        setClosingStocks({
                          ...closingStocks,
                          [product.id]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                      placeholder={t('dailyClose.closingStock')}
                      min="0"
                      disabled={submitting || isLocked}
                    />
                    {alreadyClosed && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = new Set(unlockedProductIds)
                          if (next.has(product.id)) {
                            next.delete(product.id)
                          } else {
                            next.add(product.id)
                          }
                          setUnlockedProductIds(next)
                        }}
                        disabled={submitting}
                        className="mt-2 text-sm font-semibold text-blue-700 disabled:text-gray-400"
                      >
                        {isUnlocked
                          ? t('dailyClose.lockCorrection')
                          : t('dailyClose.unlockCorrection')}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-900">{t('dailyClose.warning')}</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors active:bg-green-800"
          >
            {submitting ? t('dailyClose.closing') : t('dailyClose.complete')}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
        </>
      )}
      </form>
    </div>
  )
}
