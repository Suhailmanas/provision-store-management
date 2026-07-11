'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productVariants, inventoryLogV2, purchasesV2, salesV2 } from '@/lib/db/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')
  return userId
}

export async function createVariant(data: {
  productId: string
  brand?: string
  packSize: number
  unit: string
  buyingPrice: number
  sellingPrice: number
  minimumStock?: number
  fastMoving?: boolean
  expiryTracking?: boolean
  opening_stock?: number
}) {
  const userId = await getUserId()

  const result = await db
    .insert(productVariants)
    .values({
      userId,
      productId: data.productId,
      brand: data.brand,
      packSize: data.packSize,
      unit: data.unit,
      buyingPrice: data.buyingPrice.toString(),
      sellingPrice: data.sellingPrice.toString(),
      minimumStock: data.minimumStock || 5,
      fastMoving: data.fastMoving || false,
      expiryTracking: data.expiryTracking || false,
      opening_stock: data.opening_stock || 0,
      current_stock: data.opening_stock || 0,
      active: true,
    })
    .returning()

  revalidatePath('/')
  revalidatePath('/categories')
  return result[0]
}

export async function updateVariant(
  id: string,
  data: {
    brand?: string
    packSize?: number
    unit?: string
    buyingPrice?: number
    sellingPrice?: number
    minimumStock?: number
    fastMoving?: boolean
    expiryTracking?: boolean
    active?: boolean
  }
) {
  const userId = await getUserId()

  const updateData: any = {}
  if (data.brand !== undefined) updateData.brand = data.brand
  if (data.packSize !== undefined) updateData.packSize = data.packSize
  if (data.unit !== undefined) updateData.unit = data.unit
  if (data.buyingPrice !== undefined) updateData.buyingPrice = data.buyingPrice.toString()
  if (data.sellingPrice !== undefined) updateData.sellingPrice = data.sellingPrice.toString()
  if (data.minimumStock !== undefined) updateData.minimumStock = data.minimumStock
  if (data.fastMoving !== undefined) updateData.fastMoving = data.fastMoving
  if (data.expiryTracking !== undefined) updateData.expiryTracking = data.expiryTracking
  if (data.active !== undefined) updateData.active = data.active

  const result = await db
    .update(productVariants)
    .set(updateData)
    .where(and(eq(productVariants.id, id), eq(productVariants.userId, userId)))
    .returning()

  revalidatePath('/')
  revalidatePath('/categories')
  return result[0]
}

export async function deleteVariant(id: string) {
  const userId = await getUserId()

  await db
    .delete(productVariants)
    .where(and(eq(productVariants.id, id), eq(productVariants.userId, userId)))

  revalidatePath('/')
  revalidatePath('/categories')
}

export async function getVariantsByProduct(productId: string) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(productVariants)
    .where(and(
      eq(productVariants.userId, userId),
      eq(productVariants.productId, productId),
      eq(productVariants.active, true)
    ))

  return result.map(v => ({
    ...v,
    buyingPrice: parseFloat(v.buyingPrice as any),
    sellingPrice: parseFloat(v.sellingPrice as any),
  }))
}

export async function getVariantById(id: string) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.id, id), eq(productVariants.userId, userId)))
    .limit(1)

  if (!result[0]) return null
  return {
    ...result[0],
    buyingPrice: parseFloat(result[0].buyingPrice as any),
    sellingPrice: parseFloat(result[0].sellingPrice as any),
  }
}

// Inventory operations on variants

export async function addPurchaseV2(data: {
  variantId: string
  quantity: number
  cost?: number
}) {
  const userId = await getUserId()

  const variant = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.id, data.variantId), eq(productVariants.userId, userId)))
    .limit(1)

  if (!variant[0]) throw new Error('Variant not found')

  const costPerUnit = data.cost || parseFloat(variant[0].buyingPrice as any)

  const purchase = await db
    .insert(purchasesV2)
    .values({
      userId,
      variantId: data.variantId,
      quantity: data.quantity,
      cost: (costPerUnit * data.quantity).toString(),
    })
    .returning()

  const currentStock = variant[0].current_stock || 0
  const newStock = currentStock + data.quantity

  await db
    .update(productVariants)
    .set({ current_stock: newStock })
    .where(eq(productVariants.id, data.variantId))

  await db
    .insert(inventoryLogV2)
    .values({
      userId,
      variantId: data.variantId,
      transactionType: 'purchase',
      quantityChange: data.quantity,
      previousStock: currentStock,
      newStock,
      reference_id: purchase[0]?.id,
      reference_type: 'purchase',
    })

  revalidatePath('/')
  revalidatePath('/categories')
  return purchase[0]
}

export async function addSaleV2(data: {
  variantId: string
  quantity: number
  sellingPrice?: number
}) {
  const userId = await getUserId()

  const variant = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.id, data.variantId), eq(productVariants.userId, userId)))
    .limit(1)

  if (!variant[0]) throw new Error('Variant not found')

  const currentStock = variant[0].current_stock || 0
  if (currentStock < data.quantity) throw new Error('Insufficient stock')

  const pricePerUnit = data.sellingPrice || parseFloat(variant[0].sellingPrice as any)
  const totalAmount = pricePerUnit * data.quantity

  const sale = await db
    .insert(salesV2)
    .values({
      userId,
      variantId: data.variantId,
      quantity: data.quantity,
      sellingPrice: pricePerUnit.toString(),
      totalAmount: totalAmount.toString(),
    })
    .returning()

  const newStock = currentStock - data.quantity

  await db
    .update(productVariants)
    .set({ current_stock: newStock })
    .where(eq(productVariants.id, data.variantId))

  await db
    .insert(inventoryLogV2)
    .values({
      userId,
      variantId: data.variantId,
      transactionType: 'sale',
      quantityChange: -data.quantity,
      previousStock: currentStock,
      newStock,
      reference_id: sale[0]?.id,
      reference_type: 'sale',
    })

  revalidatePath('/')
  revalidatePath('/categories')
  return sale[0]
}

// Analytics for variants

export async function getLowStockVariants() {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(productVariants)
    .where(and(
      eq(productVariants.userId, userId),
      eq(productVariants.active, true)
    ))

  const lowStock = result.filter(v => v.current_stock < v.minimumStock)
  
  return lowStock.map(v => ({
    ...v,
    buyingPrice: parseFloat(v.buyingPrice as any),
    sellingPrice: parseFloat(v.sellingPrice as any),
  }))
}

export async function getVariantSalesHistory(variantId: string) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(salesV2)
    .where(and(
      eq(salesV2.userId, userId),
      eq(salesV2.variantId, variantId)
    ))
    .orderBy(desc(salesV2.saleDate))

  return result.map(s => ({
    ...s,
    sellingPrice: parseFloat(s.sellingPrice as any),
    totalAmount: parseFloat(s.totalAmount as any),
  }))
}

export async function getVariantPurchaseHistory(variantId: string) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(purchasesV2)
    .where(and(
      eq(purchasesV2.userId, userId),
      eq(purchasesV2.variantId, variantId)
    ))
    .orderBy(desc(purchasesV2.purchaseDate))

  return result.map(p => ({
    ...p,
    cost: parseFloat(p.cost as any),
  }))
}
