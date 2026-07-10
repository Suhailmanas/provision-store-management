'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { dailyClose, products } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getDailyCloseForDate(date: Date) {
  const userId = await getUserId()
  const closeDate = new Date(date)
  closeDate.setHours(0, 0, 0, 0)

  return db
    .select({
      id: dailyClose.id,
      productId: dailyClose.productId,
      closing_stock: dailyClose.closing_stock,
      notes: dailyClose.notes,
      date: dailyClose.date,
      productName: products.name,
      unit: products.unit,
    })
    .from(dailyClose)
    .innerJoin(products, eq(dailyClose.productId, products.id))
    .where(
      and(
        eq(dailyClose.userId, userId),
        gte(dailyClose.date, new Date(closeDate)),
        lte(
          dailyClose.date,
          new Date(closeDate.getTime() + 86400000)
        )
      )
    )
}

export async function recordDailyClose(data: {
  productId: string
  closing_stock: number
  notes?: string
  date: Date
}) {
  const userId = await getUserId()

  const result = await db
    .insert(dailyClose)
    .values({
      userId,
      productId: data.productId,
      closing_stock: data.closing_stock,
      notes: data.notes,
      date: data.date,
    })
    .returning()

  revalidatePath('/')
  return result[0]
}

export async function updateDailyClose(
  id: string,
  data: { closing_stock: number; notes?: string }
) {
  const userId = await getUserId()

  const result = await db
    .update(dailyClose)
    .set(data)
    .where(and(eq(dailyClose.id, id), eq(dailyClose.userId, userId)))
    .returning()

  revalidatePath('/')
  return result[0]
}

export async function deleteDailyClose(id: string) {
  const userId = await getUserId()
  await db.delete(dailyClose).where(and(eq(dailyClose.id, id), eq(dailyClose.userId, userId)))
  revalidatePath('/')
}

export async function calculateNextDayOpening() {
  const userId = await getUserId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get today's closing stocks
  const todaysClosing = await db
    .select()
    .from(dailyClose)
    .where(
      and(
        eq(dailyClose.userId, userId),
        gte(dailyClose.date, new Date(today)),
        lte(dailyClose.date, new Date(today.getTime() + 86400000))
      )
    )

  // Tomorrow's opening should be today's closing
  return todaysClosing.map((close) => ({
    productId: close.productId,
    openingStock: close.closing_stock,
  }))
}

export async function closeDay(date: Date) {
  const userId = await getUserId()

  // Get all products and their current stocks
  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.userId, userId))

  // Record closing stock for each product
  const closingRecords = await Promise.all(
    allProducts.map((product) =>
      recordDailyClose({
        productId: product.id,
        closing_stock: product.current_stock,
        date,
      })
    )
  )

  // Create next day's opening stock (same as today's closing)
  const tomorrow = new Date(date)
  tomorrow.setDate(tomorrow.getDate() + 1)

  for (const product of allProducts) {
    const closingStock = closingRecords.find((r) => r.productId === product.id)?.closing_stock || 0
    // Update next day's opening_stock based on today's closing
    await db
      .update(products)
      .set({
        opening_stock: closingStock,
      })
      .where(and(eq(products.id, product.id), eq(products.userId, userId)))
  }

  revalidatePath('/')
  return closingRecords
}
