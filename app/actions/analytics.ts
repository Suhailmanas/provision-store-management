'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, productVariants, purchases, sales, dailyClose } from '@/lib/db/schema'
import { eq, and, gte, lte, sql, desc, sum } from 'drizzle-orm'
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
    return await getDashboardStatsInner()
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
        total: sql`SUM(${productVariants.currentStock})`,
      })
      .from(productVariants)
      .where(eq(productVariants.userId, userId))

    // Low stock products
    const lowStockProducts = await db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.userId, userId), eq(productVariants.activeStatus, true)))
      .then((items) => items.filter((item) => item.currentStock <= item.minimumStock))

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
      variantName: productVariants.variantName,
      variantSize: productVariants.size,
      quantity: sales.quantity,
      sellingPrice: sales.sellingPrice,
      totalAmount: sales.totalAmount,
      saleDate: sales.saleDate,
    })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .innerJoin(productVariants, eq(sales.variantId, productVariants.id))
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

export async function getTodaysSales() {
  const userId = await getUserId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  try {
    const result = await db
      .select({
        totalAmount: sum(sales.totalAmount),
        quantity: sum(sales.quantity),
        count: sql`count(*)`,
      })
      .from(sales)
      .where(and(
        eq(sales.userId, userId),
        gte(sales.saleDate, today),
        lte(sales.saleDate, tomorrow)
      ))

    return {
      totalAmount: parseFloat(result[0]?.totalAmount || '0'),
      quantity: result[0]?.quantity || 0,
      count: result[0]?.count ? parseInt(result[0].count.toString()) : 0,
    }
  } catch (error) {
    console.error('[v0] Error in getTodaysSales:', error)
    return { totalAmount: 0, quantity: 0, count: 0 }
  }
}

export async function getTodaysPurchases() {
  const userId = await getUserId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  try {
    const result = await db
      .select({
        totalCost: sum(purchases.cost),
        quantity: sum(purchases.quantity),
        count: sql`count(*)`,
      })
      .from(purchases)
      .where(and(
        eq(purchases.userId, userId),
        gte(purchases.purchaseDate, today),
        lte(purchases.purchaseDate, tomorrow)
      ))

    return {
      totalCost: parseFloat(result[0]?.totalCost || '0'),
      quantity: result[0]?.quantity || 0,
      count: result[0]?.count ? parseInt(result[0].count.toString()) : 0,
    }
  } catch (error) {
    console.error('[v0] Error in getTodaysPurchases:', error)
    return { totalCost: 0, quantity: 0, count: 0 }
  }
}

export async function getMonthlyAnalytics(year: number, month: number) {
  const userId = await getUserId()
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)

  const monthlySales = await db
    .select({
      totalAmount: sum(sales.totalAmount),
      quantity: sum(sales.quantity),
    })
    .from(sales)
    .where(and(
      eq(sales.userId, userId),
      gte(sales.saleDate, startDate),
      lte(sales.saleDate, endDate)
    ))

  const monthlyPurchases = await db
    .select({
      totalCost: sum(purchases.cost),
      quantity: sum(purchases.quantity),
    })
    .from(purchases)
    .where(and(
      eq(purchases.userId, userId),
      gte(purchases.purchaseDate, startDate),
      lte(purchases.purchaseDate, endDate)
    ))

  return {
    sales: {
      totalAmount: parseFloat(monthlySales[0]?.totalAmount || '0'),
      quantity: monthlySales[0]?.quantity || 0,
    },
    purchases: {
      totalCost: parseFloat(monthlyPurchases[0]?.totalCost || '0'),
      quantity: monthlyPurchases[0]?.quantity || 0,
    },
    profit: parseFloat(monthlySales[0]?.totalAmount || '0') - parseFloat(monthlyPurchases[0]?.totalCost || '0'),
  }
}

export async function getOpeningStock(productId: string) {
  const userId = await getUserId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get yesterday's closing stock
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const yesterdayClose = await db
    .select()
    .from(dailyClose)
    .where(and(
      eq(dailyClose.userId, userId),
      eq(dailyClose.productId, productId),
      eq(dailyClose.date, yesterday)
    ))
    .limit(1)

  if (yesterdayClose[0]) {
    return yesterdayClose[0].closing_stock
  }

  // If no yesterday close, return product opening stock
  const product = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.userId, userId)))
    .limit(1)

  return product[0]?.opening_stock || 0
}
