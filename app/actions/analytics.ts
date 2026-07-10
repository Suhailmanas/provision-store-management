'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, purchases, sales } from '@/lib/db/schema'
import { eq, and, gte, lte, sql } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) throw new Error('Unauthorized')
    return session.user.id
  } catch (error) {
    console.error('[v0] Error getting session:', error)
    throw new Error('Failed to authenticate')
  }
}

export async function getDashboardStats() {
  try {
    const userId = await getUserId()
    // rest of function continues...
  } catch (error) {
    console.error('[v0] Dashboard stats error:', error)
    // Return default stats on error instead of throwing
    return {
      totalProducts: 0,
      todaysSalesQuantity: 0,
      todaysSalesAmount: 0,
      totalInventoryItems: 0,
      lowStockCount: 0,
    }
  }
}

// Inner function to avoid double error handling
async function getDashboardStatsInner() {
  const userId = await getUserId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  try {
    // Total products
    const productCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(products)
      .where(eq(products.userId, userId))

    // Today's sales
    const todaysSalesData = await db
      .select({
        quantity: sql`SUM(${sales.quantity})`,
        total: sql`SUM(${sales.totalAmount})`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.userId, userId),
          gte(sales.saleDate, today),
          lte(sales.saleDate, new Date(today.getTime() + 86400000))
        )
      )

    // Total inventory value
    const inventoryValue = await db
      .select({
        total: sql`SUM(${products.current_stock})`,
      })
      .from(products)
      .where(eq(products.userId, userId))

    // Low stock products
    const lowStockProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.userId, userId)))
      .then((p) => p.filter((prod) => prod.current_stock < 10))

    return {
      totalProducts: Number(productCount[0]?.count || 0),
      todaysSalesQuantity: Number(todaysSalesData[0]?.quantity || 0),
      todaysSalesAmount: Number(todaysSalesData[0]?.total || 0),
      totalInventoryItems: Number(inventoryValue[0]?.total || 0),
      lowStockCount: lowStockProducts.length,
    }
  } catch (error) {
    console.error('[v0] Error querying dashboard stats:', error)
    throw error
  }
}

export async function getDailySalesReport(date: Date) {
  const userId = await getUserId()
  const startDate = new Date(date)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(startDate.getTime() + 86400000)

  return db
    .select({
      productName: products.name,
      quantity: sales.quantity,
      sellingPrice: sales.sellingPrice,
      totalAmount: sales.totalAmount,
      saleDate: sales.saleDate,
    })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .where(
      and(
        eq(sales.userId, userId),
        gte(sales.saleDate, startDate),
        lte(sales.saleDate, endDate)
      )
    )
    .orderBy(desc(sales.createdAt))
}

export async function getWeeklySalesReport(startDate: Date) {
  const userId = await getUserId()
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start.getTime() + 7 * 86400000)

  const result = await db
    .select({
      date: sql`DATE(${sales.saleDate})`,
      quantity: sql`SUM(${sales.quantity})`,
      total: sql`SUM(${sales.totalAmount})`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.userId, userId),
        gte(sales.saleDate, start),
        lte(sales.saleDate, end)
      )
    )
    .groupBy(sql`DATE(${sales.saleDate})`)
    .orderBy(desc(sql`DATE(${sales.saleDate})`))

  return result
}

export async function getProductProfitReport(productId: string) {
  const userId = await getUserId()

  const purchaseData = await db
    .select({
      quantity: sql`SUM(${purchases.quantity})`,
      totalCost: sql`SUM(${sql`${purchases.quantity} * CAST(${purchases.cost} AS DECIMAL)`})`,
    })
    .from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.productId, productId)))

  const salesData = await db
    .select({
      quantity: sql`SUM(${sales.quantity})`,
      totalRevenue: sql`SUM(${sales.totalAmount})`,
    })
    .from(sales)
    .where(and(eq(sales.userId, userId), eq(sales.productId, productId)))

  const productData = await db.select().from(products).where(eq(products.id, productId)).limit(1)

  return {
    productName: productData[0]?.name,
    totalPurchased: Number(purchaseData[0]?.quantity || 0),
    totalCost: Number(purchaseData[0]?.totalCost || 0),
    totalSold: Number(salesData[0]?.quantity || 0),
    totalRevenue: Number(salesData[0]?.totalRevenue || 0),
    currentStock: productData[0]?.current_stock || 0,
  }
}

import { desc } from 'drizzle-orm'
