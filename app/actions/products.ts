'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, purchases, sales, inventoryLog } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
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
    })
    .returning()
  
  revalidatePath('/')
  return result[0]
}

export async function updateProduct(
  id: string,
  data: { name?: string; category?: string; unit?: string }
) {
  const userId = await getUserId()
  const result = await db
    .update(products)
    .set(data)
    .where(and(eq(products.id, id), eq(products.userId, userId)))
    .returning()
  
  revalidatePath('/')
  return result[0]
}

export async function deleteProduct(id: string) {
  const userId = await getUserId()
  await db.delete(products).where(and(eq(products.id, id), eq(products.userId, userId)))
  revalidatePath('/')
}

export async function addPurchase(data: {
  productId: string
  quantity: number
  cost: number
  purchaseDate: string
}) {
  const userId = await getUserId()

  // Record the purchase
  const purchase = await db
    .insert(purchases)
    .values({
      userId,
      productId: data.productId,
      quantity: data.quantity,
      cost: data.cost.toString(),
      purchaseDate: new Date(data.purchaseDate),
    })
    .returning()

  // Get current stock
  const product = await db.select().from(products).where(eq(products.id, data.productId)).limit(1)
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

  revalidatePath('/')
  return purchase[0]
}

export async function addSale(data: {
  productId: string
  quantity: number
  sellingPrice: number
  saleDate: string
}) {
  const userId = await getUserId()

  // Get current stock to validate
  const product = await db.select().from(products).where(eq(products.id, data.productId)).limit(1)
  const currentStock = product[0]?.current_stock || 0

  if (currentStock < data.quantity) {
    throw new Error('Insufficient stock')
  }

  // Record the sale
  const sale = await db
    .insert(sales)
    .values({
      userId,
      productId: data.productId,
      quantity: data.quantity,
      sellingPrice: data.sellingPrice.toString(),
      totalAmount: (data.sellingPrice * data.quantity).toString(),
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
