import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getCategories } from '@/app/actions/categories'
import CategoriesGrid from '@/components/categories-grid'
import Navigation from '@/components/navigation'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const categories = await getCategories()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 pb-24">
        <div className="bg-blue-600 text-white px-4 py-6">
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-blue-100 mt-1 text-sm">Manage your product categories</p>
        </div>

        <div className="px-4 py-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">All Categories</h2>
            <a
              href="/categories/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              + New Category
            </a>
          </div>

          <CategoriesGrid categories={categories} />
        </div>
      </div>

      <Navigation />
    </div>
  )
}
