'use client'

import { useState } from 'react'
import { getDashboardStats } from '@/app/actions/analytics'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  return (
    <div className="space-y-4">
      {/* Report Type Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-4">Report Type</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setReportType('daily')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors ${
              reportType === 'daily'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors ${
              reportType === 'weekly'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Weekly Report
          </button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Sales Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-4">Sales Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span className="text-gray-700">Total Sales Quantity</span>
            <span className="font-bold text-green-600">-- units</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span className="text-gray-700">Total Revenue</span>
            <span className="font-bold text-green-600">₹--</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
            <span className="text-gray-700">Average Transaction</span>
            <span className="font-bold text-blue-600">₹--</span>
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-4">Inventory Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
            <span className="text-gray-700">Total Products</span>
            <span className="font-bold text-purple-600">-- items</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
            <span className="text-gray-700">Low Stock Items</span>
            <span className="font-bold text-orange-600">-- items</span>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-4">Export Report</h3>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
          📥 Download as PDF
        </button>
      </div>
    </div>
  )
}
