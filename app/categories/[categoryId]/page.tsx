import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getCategoryById } from '@/app/actions/categories'
import { getProductsByCategory } from '@/app/actions/new-products'
import CategoryDetail from '@/components/category-detail'
import Navigation from '@/components/navigation'

export const dynamic = 'force-dynamic'

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const { categoryId } = await params
  const category = await getCategoryById(categoryId)
  if (!category) redirect('/categories')

  const products = await getProductsByCategory(categoryId)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 pb-24">
        <div className="px-4 py-6 max-w-6xl mx-auto">
          <CategoryDetail category={category} products={products} />
        </div>
      </div>

      <Navigation />
    </div>
  )
}
