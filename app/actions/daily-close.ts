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

function formatDateString(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function getDailyCloseForDate(date: Date) {
  const userId = await getUserId()
  const dateString = formatDateString(new Date(date))

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
      and(eq(dailyClose.userId, userId), eq(dailyClose.date, dateString))
    )
}

export async function recordDailyClose(data: {
  productId: string
  closing_stock: number
  notes?: string
  date: string
}) {
  const userId = await getUserId()

  const existing = await db
    .select({ id: dailyClose.id })
    .from(dailyClose)
    .where(
      and(
        eq(dailyClose.userId, userId),
        eq(dailyClose.productId, data.productId),
        eq(dailyClose.date, data.date)
      )
    )
    .limit(1)

  if (existing.length > 0) {
    const result = await db
      .update(dailyClose)
      .set({
        closing_stock: data.closing_stock,
        notes: data.notes,
      })
      .where(and(eq(dailyClose.id, existing[0].id), eq(dailyClose.userId, userId)))
      .returning()

    await db
      .update(products)
      .set({ current_stock: data.closing_stock })
      .where(and(eq(products.id, data.productId), eq(products.userId, userId)))

    revalidatePath('/')
    revalidatePath('/daily-close')
    return result[0]
  }

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

  await db
    .update(products)
    .set({ current_stock: data.closing_stock })
    .where(and(eq(products.id, data.productId), eq(products.userId, userId)))

  revalidatePath('/')
  revalidatePath('/daily-close')
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
  revalidatePath('/daily-close')
  return result[0]
}

export async function deleteDailyClose(id: string) {
  const userId = await getUserId()
  await db.delete(dailyClose).where(and(eq(dailyClose.id, id), eq(dailyClose.userId, userId)))
  revalidatePath('/')
  revalidatePath('/daily-close')
}

export async function calculateNextDayOpening() {
  const userId = await getUserId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get today's closing stocks
  const todayString = formatDateString(today)

  const todaysClosing = await db
    .select()
    .from(dailyClose)
    .where(and(eq(dailyClose.userId, userId), eq(dailyClose.date, todayString)))

  // Tomorrow's opening should be today's closing
  return todaysClosing.map((close) => ({
    productId: close.productId,
    openingStock: close.closing_stock,
  }))
}

export async function closeDay(date: Date, closingStocks: Record<string, number>) {
  const userId = await getUserId()
  const dateString = formatDateString(date)

  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.userId, userId))

  const closingRecords = await Promise.all(
    allProducts.map(async (product) => {
      const closing_stock = Number(
        closingStocks[product.id] ?? product.current_stock
      )

      const existing = await db
        .select({ id: dailyClose.id })
        .from(dailyClose)
        .where(
          and(
            eq(dailyClose.userId, userId),
            eq(dailyClose.productId, product.id),
            eq(dailyClose.date, dateString)
          )
        )
        .limit(1)

      const result =
        existing.length > 0
          ? await db
              .update(dailyClose)
              .set({ closing_stock })
              .where(and(eq(dailyClose.id, existing[0].id), eq(dailyClose.userId, userId)))
              .returning()
          : await db
              .insert(dailyClose)
              .values({
                userId,
                productId: product.id,
                closing_stock,
                date: dateString,
              })
              .returning()

      return result[0]
    })
  )

  for (const product of allProducts) {
    const closingStock = closingRecords.find((r) => r.productId === product.id)?.closing_stock || 0
    await db
      .update(products)
      .set({ current_stock: closingStock, opening_stock: closingStock })
      .where(and(eq(products.id, product.id), eq(products.userId, userId)))
  }

  revalidatePath('/')
  revalidatePath('/daily-close')
  return closingRecords
}
