'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/language-provider'
import { getDashboardStats } from '@/app/actions/analytics'

type ReportRow = {
  productName: string
  quantity: number
  sellingPrice: string
  totalAmount: string
  saleDate: string
}

type ReportSummary = {
  totalSalesQuantity: number
  totalRevenue: number
  averageTransaction: number
  totalProducts: number
  lowStockItems: number
}

const defaultSummary: ReportSummary = {
  totalSalesQuantity: 0,
  totalRevenue: 0,
  averageTransaction: 0,
  totalProducts: 0,
  lowStockItems: 0,
}

export default function ReportsPage() {
  const { t } = useLanguage()
  const [reportType, setReportType] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [rows, setRows] = useState<ReportRow[]>([])
  const [summary, setSummary] = useState<ReportSummary>(defaultSummary)
  const [loadingReport, setLoadingReport] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [error, setError] = useState('')

  function parseAmount(amount: string) {
    const value = Number(String(amount).replace(/[^0-9.-]+/g, ''))
    return Number.isNaN(value) ? 0 : value
  }

  async function loadInventoryStats() {
    setLoadingStats(true)
    try {
      const stats = await getDashboardStats()
      setSummary((prev) => ({
        ...prev,
        totalProducts: stats?.totalProducts ?? 0,
        lowStockItems: stats?.lowStockCount ?? 0,
      }))
    } catch (err) {
      console.error('Error loading inventory stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    loadInventoryStats()
  }, [])

  async function fetchDailyReport() {
    setError('')
    setLoadingReport(true)
    try {
      const res = await fetch('/api/reports/daily', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Failed')
      const data = json.data || []
      setRows(data)

      const totalSalesQuantity = data.reduce((sum: number, row: ReportRow) => sum + Number(row.quantity || 0), 0)
      const totalRevenue = data.reduce((sum: number, row: ReportRow) => sum + parseAmount(row.totalAmount), 0)
      const averageTransaction = data.length > 0 ? totalRevenue / data.length : 0

      setSummary((prev) => ({
        ...prev,
        totalSalesQuantity,
        totalRevenue,
        averageTransaction,
      }))

      await loadInventoryStats()
    } catch (err) {
      console.error('Error fetching report:', err)
      setError(String(err))
    } finally {
      setLoadingReport(false)
    }
  }

  async function downloadReport(format: 'excel' | 'csv') {
    try {
      const res = await fetch('/api/reports/daily', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, format }),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to download')
      }

      const contentType = res.headers.get('content-type') || ''
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // If server returned CSV, force .csv extension so Excel can open it.
      const isCsv = contentType.includes('text/csv') || contentType.includes('application/csv')
      const ext = isCsv ? 'csv' : format === 'excel' ? 'xlsx' : 'csv'

      a.download = `daily-report-${selectedDate}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(`Download ${format} error:`, err)
      alert(String(err))
    }
  }

  async function downloadXlsx() {
    // Generate a real .xlsx file client-side using SheetJS (xlsx).
    try {
      if (rows.length === 0) await fetchDailyReport()

      const XLSX = await import('xlsx')

      const data = rows.map((r) => ({
        Product: r.productName,
        Quantity: r.quantity,
        PricePerUnit: r.sellingPrice,
        Total: r.totalAmount,
        Date: new Date(r.saleDate).toLocaleString(),
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Report')
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

      const blob = new Blob([wbout], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `daily-report-${selectedDate}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('XLSX export failed', err)
      alert('XLSX export failed. Make sure the `xlsx` package is installed locally.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Report Type Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-4">{t('reports.type')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setReportType('daily')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors ${
              reportType === 'daily'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {t('reports.daily')}
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors ${
              reportType === 'weekly'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {t('reports.weekly')}
          </button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">{t('reports.selectDate')}</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Sales Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-4">{t('reports.salesSummary')}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span className="text-gray-700">{t('reports.totalSalesQuantity')}</span>
            <span className="font-bold text-green-600">{summary.totalSalesQuantity} units</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span className="text-gray-700">{t('reports.totalRevenue')}</span>
            <span className="font-bold text-green-600">₹{summary.totalRevenue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
            <span className="text-gray-700">{t('reports.averageTransaction')}</span>
            <span className="font-bold text-blue-600">₹{summary.averageTransaction.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-4">{t('reports.inventoryStatus')}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
            <span className="text-gray-700">{t('reports.totalProducts')}</span>
            <span className="font-bold text-purple-600">{summary.totalProducts} items</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
            <span className="text-gray-700">{t('reports.lowStockItems')}</span>
            <span className="font-bold text-orange-600">{summary.lowStockItems} items</span>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-4">{t('reports.export')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={fetchDailyReport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            disabled={loadingReport}
          >
            {loadingReport ? 'Loading...' : `🔍 ${t('reports.load')}`}
          </button>

          <button
            onClick={async () => {
              // Try client-side xlsx generation first; fall back to server CSV if unavailable
              try {
                await downloadXlsx()
              } catch (e) {
                console.warn('xlsx client export failed, falling back to CSV', e)
                await downloadReport('excel')
              }
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            disabled={rows.length === 0}
          >
            📊 Excel
          </button>
        </div>

        <div className="mt-3">
          <button
            onClick={() => downloadReport('csv')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors"
            disabled={rows.length === 0}
          >
            📥 CSV
          </button>
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        {rows.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">{t('reports.salesSummary')}</h4>
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">{r.productName}</div>
                  <div className="text-sm text-gray-600">{r.quantity} × {r.sellingPrice} = {r.totalAmount}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
