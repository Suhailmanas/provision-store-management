import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import ProductsList from '@/components/products-list'
import Navigation from '@/components/navigation'
import PageShell from '@/components/page-shell'

export default async function ProductsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <PageShell titleKey="page.productsTitle" subtitleKey="page.productsSubtitle">
      <ProductsList />
    </PageShell>
  )
}
