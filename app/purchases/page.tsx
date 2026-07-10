import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Navigation from '@/components/navigation'
import Link from 'next/link'

export default async function PurchasesPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 pb-24">
        {/* Header */}
        <div className="bg-green-600 text-white px-4 py-6">
          <h1 className="text-2xl font-bold">Purchases</h1>
          <p className="text-green-100 mt-1">Purchase history</p>
        </div>

        {/* Content */}
        <div className="px-4 py-6 max-w-2xl mx-auto">
          <Link
            href="/purchases/new"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mb-6 text-center transition-colors active:bg-blue-800"
          >
            + New Purchase
          </Link>

          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-500">Purchase history will appear here</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}
