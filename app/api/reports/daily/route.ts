import { NextResponse } from 'next/server'
import { getDailySalesReport } from '@/app/actions/analytics'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const date = new Date(body.date)
    const format = body.format || 'json'
    const data = await getDailySalesReport(date)

    if (format === 'csv' || format === 'excel') {
      // build CSV
      const header = ['Product', 'Quantity', 'PricePerUnit', 'Total', 'Date']
      const rows = (data || []).map((r: any) => [
        `"${String(r.productName || '').replace(/"/g, '""')}"`,
        String(r.quantity || ''),
        String(r.sellingPrice || ''),
        String(r.totalAmount || ''),
        `"${new Date(r.saleDate).toISOString()}"`,
      ].join(','))

      // Prepend UTF-8 BOM and use CRLF line endings for best Excel compatibility on Windows
      const csvBody = [header.join(','), ...rows].join('\r\n')
      const csv = '\uFEFF' + csvBody
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          // Always return a .csv filename so Excel can open the file reliably
          'Content-Disposition': `attachment; filename="daily-report-${date.toISOString().slice(0,10)}.csv"`,
        },
      })
    }

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    console.error('Error in /api/reports/daily:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
