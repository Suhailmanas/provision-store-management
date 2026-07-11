'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, purchases, sales, inventoryLog, productPriceHistory, productExpiry } from '@/lib/db/schema'
import { and, eq, desc, gte, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getProducts() {
  const userId = await getUserId()
  return db
    .select()
    .from(products)
    .where(eq(products.userId, userId))
    .orderBy(desc(products.createdAt))
}

export async function createProduct(data: {
  name: string
  category?: string
  unit: string
  opening_stock: number
  buyingPrice: number
  sellingPrice: number
  minimumStock?: number
  fastMoving?: boolean
  expiryTracking?: boolean
}) {
  const userId = await getUserId()
  const result = await db
    .insert(products)
    .values({
      userId,
      name: data.name,
      category: data.category,
      unit: data.unit,
      opening_stock: data.opening_stock,
      current_stock: data.opening_stock,
      buyingPrice: data.buyingPrice.toString(),
      sellingPrice: data.sellingPrice.toString(),
      minimumStock: data.minimumStock || 5,
      fastMoving: data.fastMoving || false,
      expiryTracking: data.expiryTracking || false,
      active: true,
    })
    .returning()
  
  // Record initial price history
  if (result[0]) {
    await db.insert(productPriceHistory).values({
      userId,
      productId: result[0].id,
      buyingPrice: data.buyingPrice.toString(),
      sellingPrice: data.sellingPrice.toString(),
    })
  }
  
  revalidatePath('/')
  revalidatePath('/products')
  return result[0]
}

export async function getProduct(id: string) {
  const userId = await getUserId()
  const result = await db
    .select()
    .from(products)
    .where(and(eq(products.userId, userId), eq(products.id, id)))
    .limit(1)

  return result[0]
}

export async function updateProduct(
  id: string,
  data: {
    name?: string
    category?: string
    unit?: string
    opening_stock?: number
    current_stock?: number
    buyingPrice?: number
    sellingPrice?: number
    minimumStock?: number
    fastMoving?: boolean
    expiryTracking?: boolean
    active?: boolean
  }
) {
  const userId = await getUserId()
  
  // Get current product to check for price changes
  const current = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.userId, userId)))
    .limit(1)
  
  const updateData: any = {}
  let priceChanged = false
  
  if (data.name !== undefined) updateData.name = data.name
  if (data.category !== undefined) updateData.category = data.category
  if (data.unit !== undefined) updateData.unit = data.unit
  if (data.opening_stock !== undefined) updateData.opening_stock = data.opening_stock
  if (data.current_stock !== undefined) updateData.current_stock = data.current_stock
  if (data.minimumStock !== undefined) updateData.minimumStock = data.minimumStock
  if (data.fastMoving !== undefined) updateData.fastMoving = data.fastMoving
  if (data.expiryTracking !== undefined) updateData.expiryTracking = data.expiryTracking
  if (data.active !== undefined) updateData.active = data.active
  
  if (data.buyingPrice !== undefined) {
    updateData.buyingPrice = data.buyingPrice.toString()
    priceChanged = true
  }
  if (data.sellingPrice !== undefined) {
    updateData.sellingPrice = data.sellingPrice.toString()
    priceChanged = true
  }
  
  const result = await db
    .update(products)
    .set(updateData)
    .where(and(eq(products.id, id), eq(products.userId, userId)))
    .returning()
  
  // Record price history if prices changed
  if (priceChanged && current[0]) {
    await db.insert(productPriceHistory).values({
      userId,
      productId: id,
      buyingPrice: (data.buyingPrice || parseFloat(current[0].buyingPrice as any)).toString(),
      sellingPrice: (data.sellingPrice || parseFloat(current[0].sellingPrice as any)).toString(),
    })
  }
  
  revalidatePath('/')
  revalidatePath('/products')
  return result[0]
}

export async function deleteProduct(id: string) {
  const userId = await getUserId()
  await db.delete(products).where(and(eq(products.id, id), eq(products.userId, userId)))
  revalidatePath('/')
  revalidatePath('/products')
}

export async function addPurchase(data: {
  productId: string
  quantity: number
  cost?: number
  purchaseDate: string
  batchNumber?: string
  expiryDate?: string
}) {
  const userId = await getUserId()

  // Get product to get current buying price if not specified
  const product = await db.select().from(products).where(eq(products.id, data.productId)).limit(1)
  if (!product[0]) throw new Error('Product not found')
  
  const costPerUnit = data.cost || parseFloat(product[0].buyingPrice as any)

  // Record the purchase
  const purchase = await db
    .insert(purchases)
    .values({
      userId,
      productId: data.productId,
      quantity: data.quantity,
      cost: (costPerUnit * data.quantity).toString(),
      purchaseDate: new Date(data.purchaseDate),
    })
    .returning()

  // Get current stock
  const currentStock = product[0]?.current_stock || 0
  const newStock = currentStock + data.quantity

  // Update product stock
  await db
    .update(products)
    .set({ current_stock: newStock })
    .where(and(eq(products.id, data.productId), eq(products.userId, userId)))

  // Log the inventory change
  await db
    .insert(inventoryLog)
    .values({
      userId,
      productId: data.productId,
      transactionType: 'purchase',
      quantityChange: data.quantity,
      previousStock: currentStock,
      newStock,
      reference_id: purchase[0]?.id,
      reference_type: 'purchase',
    })

  // Track expiry if enabled
  if (product[0]?.expiryTracking && data.expiryDate && data.batchNumber) {
    await db.insert(productExpiry).values({
      userId,
      productId: data.productId,
      batchNumber: data.batchNumber,
      quantity: data.quantity,
      expiryDate: new Date(data.expiryDate),
      purchaseDate: new Date(data.purchaseDate),
    })
  }

  revalidatePath('/')
  return purchase[0]
}

export async function addSale(data: {
  productId: string
  quantity: number
  sellingPrice?: number
  saleDate: string
}) {
  const userId = await getUserId()

  // Get current stock to validate
  const product = await db.select().from(products).where(eq(products.id, data.productId)).limit(1)
  if (!product[0]) throw new Error('Product not found')
  
  const currentStock = product[0]?.current_stock || 0

  if (currentStock < data.quantity) {
    throw new Error('Insufficient stock')
  }

  // Use provided selling price or default to product master price
  const pricePerUnit = data.sellingPrice || parseFloat(product[0].sellingPrice as any)
  const totalAmount = pricePerUnit * data.quantity

  // Record the sale
  const sale = await db
    .insert(sales)
    .values({
      userId,
      productId: data.productId,
      quantity: data.quantity,
      sellingPrice: pricePerUnit.toString(),
      totalAmount: totalAmount.toString(),
      saleDate: new Date(data.saleDate),
    })
    .returning()

  const newStock = currentStock - data.quantity

  // Update product stock
  await db
    .update(products)
    .set({ current_stock: newStock })
    .where(and(eq(products.id, data.productId), eq(products.userId, userId)))

  // Log the inventory change
  await db
    .insert(inventoryLog)
    .values({
      userId,
      productId: data.productId,
      transactionType: 'sale',
      quantityChange: -data.quantity,
      previousStock: currentStock,
      newStock,
      reference_id: sale[0]?.id,
      reference_type: 'sale',
    })

  revalidatePath('/')
  return sale[0]
}

// Get 7-day average consumption for a product
export async function getSevenDayAverage(productId: string) {
  const userId = await getUserId()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const result = await db
    .select()
    .from(sales)
    .where(and(
      eq(sales.userId, userId),
      eq(sales.productId, productId),
      gte(sales.saleDate, sevenDaysAgo)
    ))

  const totalQuantity = result.reduce((sum, sale) => sum + sale.quantity, 0)
  return Math.ceil(totalQuantity / 7) // Average per day
}

// Get low stock products
export async function getLowStockProducts() {
  const userId = await getUserId()
  
  const allProducts = await db
    .select()
    .from(products)
    .where(and(
      eq(products.userId, userId),
      eq(products.active, true)
    ))

  const lowStockAlerts = []
  
  for (const product of allProducts) {
    // Skip fast-moving products
    if (product.fastMoving) continue
    
    // Check if we have 7 days of data
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentSales = await db
      .select()
      .from(sales)
      .where(and(
        eq(sales.userId, userId),
        eq(sales.productId, product.id),
        gte(sales.saleDate, sevenDaysAgo)
      ))
    
    if (recentSales.length > 0) {
      const avgDaily = await getSevenDayAverage(product.id)
      const recommendedStock = avgDaily * 3 // 3-day safety stock
      
      if (product.current_stock < recommendedStock) {
        lowStockAlerts.push({
          productId: product.id,
          name: product.name,
          currentStock: product.current_stock,
          recommendedStock: Math.ceil(recommendedStock),
          averageDailyConsumption: avgDaily,
          minimumStock: product.minimumStock,
        })
      }
    }
  }
  
  return lowStockAlerts
}

// Get expiry alerts
export async function getExpiryAlerts() {
  const userId = await getUserId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const thirtyDaysLater = new Date(today)
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

  const expiryData = await db
    .select()
    .from(productExpiry)
    .where(and(
      eq(productExpiry.userId, userId),
      lte(productExpiry.expiryDate, thirtyDaysLater),
      gte(productExpiry.expiryDate, today)
    ))

  const productsMap = new Map()
  for (const expiry of expiryData) {
    const product = productsMap.get(expiry.productId)
    if (!product) {
      const prod = await db.select().from(products).where(eq(products.id, expiry.productId)).limit(1)
      if (prod[0]) productsMap.set(expiry.productId, prod[0])
    }
  }

  return expiryData.map(expiry => ({
    ...expiry,
    productName: productsMap.get(expiry.productId)?.name || 'Unknown',
    daysUntilExpiry: Math.floor((new Date(expiry.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  }))
}

// Get purchase suggestions based on 7-day consumption
export async function getPurchaseSuggestions() {
  const userId = await getUserId()
  
  const allProducts = await db
    .select()
    .from(products)
    .where(and(
      eq(products.userId, userId),
      eq(products.active, true)
    ))

  const suggestions = []
  
  for (const product of allProducts) {
    // Skip fast-moving products
    if (product.fastMoving) continue
    
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentSales = await db
      .select()
      .from(sales)
      .where(and(
        eq(sales.userId, userId),
        eq(sales.productId, product.id),
        gte(sales.saleDate, sevenDaysAgo)
      ))
    
    if (recentSales.length > 0) {
      const avgDaily = await getSevenDayAverage(product.id)
      const recommendedStock = avgDaily * 3
      const suggestionQty = Math.max(0, Math.ceil(recommendedStock - product.current_stock))
      
      if (suggestionQty > 0) {
        suggestions.push({
          productId: product.id,
          name: product.name,
          suggestedQuantity: suggestionQty,
          currentStock: product.current_stock,
          averageDailyConsumption: avgDaily,
          buyingPrice: parseFloat(product.buyingPrice as any),
          estimatedCost: suggestionQty * parseFloat(product.buyingPrice as any),
        })
      }
    }
  }
  
  return suggestions.sort((a, b) => b.estimatedCost - a.estimatedCost)
}
