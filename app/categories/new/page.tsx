import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import CategoryForm from '@/components/category-form'
import Navigation from '@/components/navigation'

export const dynamic = 'force-dynamic'

export default async function NewCategoryPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 pb-24">
        <div className="bg-blue-600 text-white px-4 py-6">
          <h1 className="text-3xl font-bold">Create Category</h1>
          <p className="text-blue-100 mt-1 text-sm">Add a new product category</p>
        </div>

        <div className="px-4 py-6 max-w-2xl mx-auto">
          <CategoryForm />
        </div>
      </div>

      <Navigation />
    </div>
  )
}
