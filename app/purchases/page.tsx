import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Navigation from '@/components/navigation'
import Link from 'next/link'
import TranslatedLink from '@/components/translated-link'
import PageShell from '@/components/page-shell'

export default async function PurchasesPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <PageShell titleKey="page.purchasesTitle" subtitleKey="page.purchasesSubtitle">
      <TranslatedLink
        href="/purchases/new"
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mb-6 text-center transition-colors active:bg-blue-800"
        labelKey="purchases.newPurchase"
      />

      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">Purchase history will appear here</p>
      </div>
    </PageShell>
  )
}
