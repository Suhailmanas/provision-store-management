import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import SalesForm from '@/components/sales-form'
import Navigation from '@/components/navigation'

export default async function NewSalePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 pb-24">
        {/* Header */}
        <div className="bg-green-600 text-white px-4 py-6">
          <h1 className="text-2xl font-bold">Record Sale</h1>
          <p className="text-green-100 mt-1">Quick sale entry</p>
        </div>

        {/* Content */}
        <div className="px-4 py-6 max-w-2xl mx-auto">
          <SalesForm />
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}
