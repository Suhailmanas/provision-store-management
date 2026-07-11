'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')
  return userId
}

export async function createCategory(data: {
  name: string
  description?: string
  color?: string
}) {
  const userId = await getUserId()
  
  const result = await db
    .insert(categories)
    .values({
      userId,
      name: data.name,
      description: data.description,
      color: data.color || '#3B82F6',
    })
    .returning()

  revalidatePath('/')
  revalidatePath('/categories')
  return result[0]
}

export async function updateCategory(
  id: string,
  data: {
    name?: string
    description?: string
    color?: string
    active?: boolean
  }
) {
  const userId = await getUserId()

  const result = await db
    .update(categories)
    .set(data)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning()

  revalidatePath('/')
  revalidatePath('/categories')
  return result[0]
}

export async function deleteCategory(id: string) {
  const userId = await getUserId()

  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))

  revalidatePath('/')
  revalidatePath('/categories')
}

export async function getCategories() {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.active, true)))

  return result
}

export async function getCategoryById(id: string) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .limit(1)

  return result[0]
}
