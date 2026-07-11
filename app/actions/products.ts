'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, productVariants, purchases, sales, inventoryLog, productPriceHistory, productExpiry } from '@/lib/db/schema'
import { and, eq, desc, gte, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

type TypeInput = {
  id?: string
  brandName: string
  packSize: string
  unit: string
  barcode?: string | null
  expiryDate?: string
  buyingPricePerUnit: number
  sellingPricePerUnit: number
  openingStock: number
  currentStock?: number
  minimumStock?: number
  active?: boolean
}

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

function validTypes(types: TypeInput[]) {
  const cleaned = types.map((type) => ({ ...type, brandName: type.brandName.trim(), packSize: type.packSize.trim() })).filter((type) => type.brandName && type.packSize && type.unit.trim())
  if (!cleaned.length) throw new Error('Add at least one Type')
  return cleaned
}

export async function getProducts() {
  const userId = await getUserId()
  const [productRows, variantRows] = await Promise.all([
    db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.createdAt)),
    db.select().from(productVariants).where(eq(productVariants.userId, userId)),
  ])
  return productRows.map((product) => {
    const types = variantRows.filter((type) => type.productId === product.id)
    // Transitional view model for purchase/sale screens while retaining one source of truth.
    const variants = types.map((type) => ({ ...type, variantName: type.brandName, size: type.packSize, buyingPrice: type.buyingPricePerUnit, sellingPrice: type.sellingPricePerUnit, activeStatus: type.active }))
    return { ...product, types, variants, expiryTracking: product.trackExpiry }
  })
}

export async function createProduct(data: { name: string; category?: string; supplierId?: string; fastMoving?: boolean; trackExpiry?: boolean; active?: boolean; types: TypeInput[] }) {
  const userId = await getUserId()
  const types = validTypes(data.types)
  const duplicate = await db.select({ id: products.id }).from(products).where(and(eq(products.userId, userId), eq(products.name, data.name.trim()))).limit(1)
  if (duplicate.length) throw new Error('A product with this name already exists')
  const [product] = await db.insert(products).values({
    userId, name: data.name.trim(), category: data.category?.trim() || undefined, supplierId: data.supplierId?.trim() || undefined,
    fastMoving: data.fastMoving ?? false, trackExpiry: data.trackExpiry ?? false, active: data.active ?? true,
  }).returning()

  await db.insert(productVariants).values(types.map((type) => ({
    userId, productId: product.id, brandName: type.brandName, packSize: type.packSize,
    unit: type.unit, barcode: type.barcode?.trim() || undefined, expiryDate: type.expiryDate || undefined,
    buyingPricePerUnit: type.buyingPricePerUnit.toString(), sellingPricePerUnit: type.sellingPricePerUnit.toString(),
    openingStock: type.openingStock, currentStock: type.currentStock ?? type.openingStock,
    minimumStock: type.minimumStock ?? 5, active: type.active ?? true,
  })))
  revalidatePath('/'); revalidatePath('/products')
  return product
}

export async function getProduct(id: string) {
  const userId = await getUserId()
  const [result, variants] = await Promise.all([
    db.select().from(products).where(and(eq(products.userId, userId), eq(products.id, id))).limit(1),
    db.select().from(productVariants).where(and(eq(productVariants.userId, userId), eq(productVariants.productId, id))),
  ])
  return result[0] ? { ...result[0], types: variants } : undefined
}

export async function updateProduct(id: string, data: { name?: string; category?: string; supplierId?: string; fastMoving?: boolean; trackExpiry?: boolean; active?: boolean; types?: TypeInput[] }) {
  const userId = await getUserId()
  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (data.name !== undefined) updateData.name = data.name.trim()
  if (data.category !== undefined) updateData.category = data.category.trim() || null
  if (data.supplierId !== undefined) updateData.supplierId = data.supplierId.trim() || null
  if (data.fastMoving !== undefined) updateData.fastMoving = data.fastMoving
  if (data.trackExpiry !== undefined) updateData.trackExpiry = data.trackExpiry
  if (data.active !== undefined) updateData.active = data.active
  const [product] = await db.update(products).set(updateData).where(and(eq(products.id, id), eq(products.userId, userId))).returning()
  if (!product) throw new Error('Product not found')

  if (data.types) {
    const types = validTypes(data.types)
    const existing = await db.select().from(productVariants).where(and(eq(productVariants.productId, id), eq(productVariants.userId, userId)))
    const ids = new Set(types.flatMap((type) => type.id ? [type.id] : []))
    // Preserve historical records by deactivating deleted Types instead of deleting them.
    await Promise.all(existing.filter((type) => !ids.has(type.id)).map((type) => db.update(productVariants).set({ active: false, updatedAt: new Date() }).where(eq(productVariants.id, type.id))))
    for (const type of types) {
      const values = { brandName: type.brandName, packSize: type.packSize, unit: type.unit, barcode: type.barcode?.trim() || null, expiryDate: type.expiryDate || null, buyingPricePerUnit: type.buyingPricePerUnit.toString(), sellingPricePerUnit: type.sellingPricePerUnit.toString(), minimumStock: type.minimumStock ?? 5, active: type.active ?? true, updatedAt: new Date() }
      if (type.id) {
        const current = existing.find((item) => item.id === type.id)
        if (!current) throw new Error('Type not found')
        await db.update(productVariants).set(values).where(and(eq(productVariants.id, type.id), eq(productVariants.userId, userId)))
        if (current.buyingPricePerUnit !== values.buyingPricePerUnit || current.sellingPricePerUnit !== values.sellingPricePerUnit) await db.insert(productPriceHistory).values({ userId, productId: id, variantId: type.id, buyingPrice: values.buyingPricePerUnit, sellingPrice: values.sellingPricePerUnit })
      } else {
        await db.insert(productVariants).values({ userId, productId: id, ...values, openingStock: type.openingStock, currentStock: type.currentStock ?? type.openingStock })
      }
    }
  }
  revalidatePath('/'); revalidatePath('/products'); revalidatePath(`/products/${id}`)
  return product
}

export async function deleteProduct(id: string) {
  const userId = await getUserId()
  await db.delete(productVariants).where(and(eq(productVariants.productId, id), eq(productVariants.userId, userId)))
  await db.delete(products).where(and(eq(products.id, id), eq(products.userId, userId)))
  revalidatePath('/'); revalidatePath('/products')
}

async function getOwnedProductAndType(productId: string, variantId: string, userId: string) {
  const [product] = await db.select().from(products).where(and(eq(products.id, productId), eq(products.userId, userId))).limit(1)
  const [variant] = await db.select().from(productVariants).where(and(eq(productVariants.id, variantId), eq(productVariants.productId, productId), eq(productVariants.userId, userId))).limit(1)
  if (!product || !variant) throw new Error('Select a valid product and Type')
  if (!product.active || !variant.active) throw new Error('This product Type is inactive')
  return { product, variant }
}

export async function addPurchase(data: { productId: string; variantId: string; quantity: number; cost?: number; purchaseDate: string; batchNumber?: string; expiryDate?: string }) {
  const userId = await getUserId()
  const { product, variant } = await getOwnedProductAndType(data.productId, data.variantId, userId)
  const costPerUnit = data.cost ?? Number(variant.buyingPricePerUnit)
  const previousStock = variant.currentStock
  const newStock = previousStock + data.quantity
  const [purchase] = await db.insert(purchases).values({ userId, productId: product.id, variantId: variant.id, quantity: data.quantity, cost: (costPerUnit * data.quantity).toString(), buyingPricePerUnit: costPerUnit.toString(), purchaseDate: new Date(data.purchaseDate) }).returning()
  await db.update(productVariants).set({ currentStock: newStock, updatedAt: new Date() }).where(eq(productVariants.id, variant.id))
  await db.insert(inventoryLog).values({ userId, productId: product.id, variantId: variant.id, transactionType: 'purchase', quantityChange: data.quantity, previousStock, newStock, reference_id: purchase.id, reference_type: 'purchase' })
  if (product.trackExpiry && data.expiryDate && data.batchNumber) await db.insert(productExpiry).values({ userId, productId: product.id, variantId: variant.id, batchNumber: data.batchNumber, quantity: data.quantity, expiryDate: data.expiryDate, purchaseDate: data.purchaseDate })
  revalidatePath('/'); revalidatePath('/products')
  return purchase
}

export async function addSale(data: { productId: string; variantId: string; quantity: number; sellingPrice?: number; saleDate: string }) {
  const userId = await getUserId()
  const { product, variant } = await getOwnedProductAndType(data.productId, data.variantId, userId)
  if (variant.currentStock < data.quantity) throw new Error('Insufficient stock')
  const pricePerUnit = data.sellingPrice ?? Number(variant.sellingPricePerUnit)
  const previousStock = variant.currentStock
  const newStock = previousStock - data.quantity
  const [sale] = await db.insert(sales).values({ userId, productId: product.id, variantId: variant.id, quantity: data.quantity, sellingPrice: pricePerUnit.toString(), totalAmount: (pricePerUnit * data.quantity).toString(), saleDate: new Date(data.saleDate) }).returning()
  await db.update(productVariants).set({ currentStock: newStock, updatedAt: new Date() }).where(eq(productVariants.id, variant.id))
  await db.insert(inventoryLog).values({ userId, productId: product.id, variantId: variant.id, transactionType: 'sale', quantityChange: -data.quantity, previousStock, newStock, reference_id: sale.id, reference_type: 'sale' })
  revalidatePath('/'); revalidatePath('/products')
  return sale
}

export async function getSevenDayAverage(variantId: string) {
  const userId = await getUserId(); const since = new Date(); since.setDate(since.getDate() - 7)
  const result = await db.select().from(sales).where(and(eq(sales.userId, userId), eq(sales.variantId, variantId), gte(sales.saleDate, since)))
  return Math.ceil(result.reduce((total, sale) => total + sale.quantity, 0) / 7)
}

export async function getLowStockProducts() {
  const userId = await getUserId()
  const types = await db.select().from(productVariants).where(and(eq(productVariants.userId, userId), eq(productVariants.active, true)))
  const productRows = await db.select().from(products).where(and(eq(products.userId, userId), eq(products.active, true)))
  const productById = new Map(productRows.map((product) => [product.id, product]))
  return types.filter((type) => type.currentStock <= type.minimumStock && productById.has(type.productId)).map((type) => ({ productId: type.productId, typeId: type.id, name: productById.get(type.productId)!.name, brandName: type.brandName, packSize: type.packSize, currentStock: type.currentStock, minimumStock: type.minimumStock, unit: type.unit }))
}

export async function getPurchaseSuggestions() {
  const lowStock = await getLowStockProducts()
  const userId = await getUserId()
  const variants = await db.select().from(productVariants).where(eq(productVariants.userId, userId))
  return lowStock.map((item) => {
    const type = variants.find((variant) => variant.id === item.typeId)!
    const suggestedQuantity = Math.max(0, item.minimumStock * 2 - item.currentStock)
    return { ...item, suggestedQuantity, buyingPricePerUnit: Number(type.buyingPricePerUnit), estimatedCost: suggestedQuantity * Number(type.buyingPricePerUnit) }
  }).filter((item) => item.suggestedQuantity > 0)
}

export async function getExpiryAlerts() {
  const userId = await getUserId(); const today = new Date(); today.setHours(0, 0, 0, 0); const end = new Date(today); end.setDate(end.getDate() + 30)
  const toDate = (value: Date) => value.toISOString().slice(0, 10)
  const expiryData = await db.select().from(productExpiry).where(and(eq(productExpiry.userId, userId), lte(productExpiry.expiryDate, toDate(end)), gte(productExpiry.expiryDate, toDate(today))))
  const types = await db.select().from(productVariants).where(eq(productVariants.userId, userId)); const productRows = await db.select().from(products).where(eq(products.userId, userId))
  return expiryData.map((expiry) => ({ ...expiry, productName: productRows.find((p) => p.id === expiry.productId)?.name || 'Unknown', typeName: (() => { const type = types.find((v) => v.id === expiry.variantId); return type ? `${type.brandName} ${type.packSize} ${type.unit}` : 'Unknown' })(), daysUntilExpiry: Math.floor((new Date(expiry.expiryDate).getTime() - today.getTime()) / 86400000) }))
}
