'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sales, purchases, products, dailyClose } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function exportDailySalesReport(date: string) {
  const userId = await getUserId()
  const reportDate = new Date(date)
  reportDate.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(reportDate)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const saleRecords = await db
    .select({
      productName: products.name,
      category: products.category,
      unit: products.unit,
      quantity: sales.quantity,
      price: sales.sellingPrice,
      total: sales.totalAmount,
      date: sales.saleDate,
    })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .where(and(
      eq(sales.userId, userId),
      gte(sales.saleDate, reportDate),
      lte(sales.saleDate, tomorrow)
    ))

  return saleRecords.map(r => ({
    'Product Name': r.productName,
    'Category': r.category || 'N/A',
    'Unit': r.unit,
    'Quantity': r.quantity,
    'Price per Unit': r.price,
    'Total Amount': r.total,
    'Date': new Date(r.date).toLocaleDateString(),
  }))
}

export async function exportMonthlySalesReport(year: number, month: number) {
  const userId = await getUserId()
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)

  const saleRecords = await db
    .select({
      productName: products.name,
      category: products.category,
      unit: products.unit,
      quantity: sales.quantity,
      price: sales.sellingPrice,
      total: sales.totalAmount,
      date: sales.saleDate,
    })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .where(and(
      eq(sales.userId, userId),
      gte(sales.saleDate, startDate),
      lte(sales.saleDate, endDate)
    ))

  return saleRecords.map(r => ({
    'Product Name': r.productName,
    'Category': r.category || 'N/A',
    'Unit': r.unit,
    'Quantity': r.quantity,
    'Price per Unit': r.price,
    'Total Amount': r.total,
    'Date': new Date(r.date).toLocaleDateString(),
  }))
}

export async function exportDailyPurchasesReport(date: string) {
  const userId = await getUserId()
  const reportDate = new Date(date)
  reportDate.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(reportDate)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const purchaseRecords = await db
    .select({
      productName: products.name,
      category: products.category,
      unit: products.unit,
      quantity: purchases.quantity,
      cost: purchases.cost,
      date: purchases.purchaseDate,
    })
    .from(purchases)
    .innerJoin(products, eq(purchases.productId, products.id))
    .where(and(
      eq(purchases.userId, userId),
      gte(purchases.purchaseDate, reportDate),
      lte(purchases.purchaseDate, tomorrow)
    ))

  return purchaseRecords.map(r => ({
    'Product Name': r.productName,
    'Category': r.category || 'N/A',
    'Unit': r.unit,
    'Quantity': r.quantity,
    'Cost per Unit': r.cost,
    'Total Cost': parseFloat(r.cost as any) * r.quantity,
    'Date': new Date(r.date).toLocaleDateString(),
  }))
}

export async function exportMonthlyPurchasesReport(year: number, month: number) {
  const userId = await getUserId()
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)

  const purchaseRecords = await db
    .select({
      productName: products.name,
      category: products.category,
      unit: products.unit,
      quantity: purchases.quantity,
      cost: purchases.cost,
      date: purchases.purchaseDate,
    })
    .from(purchases)
    .innerJoin(products, eq(purchases.productId, products.id))
    .where(and(
      eq(purchases.userId, userId),
      gte(purchases.purchaseDate, startDate),
      lte(purchases.purchaseDate, endDate)
    ))

  return purchaseRecords.map(r => ({
    'Product Name': r.productName,
    'Category': r.category || 'N/A',
    'Unit': r.unit,
    'Quantity': r.quantity,
    'Cost per Unit': r.cost,
    'Total Cost': parseFloat(r.cost as any) * r.quantity,
    'Date': new Date(r.date).toLocaleDateString(),
  }))
}
