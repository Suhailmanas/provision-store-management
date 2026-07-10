import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import ProductForm from '@/components/product-form'
import Navigation from '@/components/navigation'
import PageShell from '@/components/page-shell'

export default async function NewProductPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <PageShell titleKey="page.newProductTitle" subtitleKey="page.newProductSubtitle">
      <ProductForm />
    </PageShell>
  )
}
