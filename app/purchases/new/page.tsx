import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import PurchasesForm from '@/components/purchases-form'
import Navigation from '@/components/navigation'
import PageShell from '@/components/page-shell'

export default async function NewPurchasePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <PageShell titleKey="page.newPurchaseTitle" subtitleKey="page.newPurchaseSubtitle">
      <PurchasesForm />
    </PageShell>
  )
}
