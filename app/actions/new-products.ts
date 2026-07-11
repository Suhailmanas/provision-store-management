'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { newProducts, productVariants } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')
  return userId
}

export async function createProduct(data: {
  categoryId: string
  name: string
  description?: string
}) {
  const userId = await getUserId()

  const result = await db
    .insert(newProducts)
    .values({
      userId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
    })
    .returning()

  revalidatePath('/')
  revalidatePath('/categories')
  return result[0]
}

export async function updateProduct(
  id: string,
  data: {
    name?: string
    description?: string
    active?: boolean
  }
) {
  const userId = await getUserId()

  const result = await db
    .update(newProducts)
    .set(data)
    .where(and(eq(newProducts.id, id), eq(newProducts.userId, userId)))
    .returning()

  revalidatePath('/')
  revalidatePath('/categories')
  return result[0]
}

export async function deleteProduct(id: string) {
  const userId = await getUserId()

  await db
    .delete(newProducts)
    .where(and(eq(newProducts.id, id), eq(newProducts.userId, userId)))

  revalidatePath('/')
  revalidatePath('/categories')
}

export async function getProductsByCategory(categoryId: string) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(newProducts)
    .where(and(
      eq(newProducts.userId, userId),
      eq(newProducts.categoryId, categoryId),
      eq(newProducts.active, true)
    ))

  return result
}

export async function getProductById(id: string) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(newProducts)
    .where(and(eq(newProducts.id, id), eq(newProducts.userId, userId)))
    .limit(1)

  return result[0]
}
