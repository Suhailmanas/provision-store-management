import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import PageShell from '@/components/page-shell'
import ProductForm from '@/components/product-form'
import { getProduct } from '@/app/actions/products'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductEditPage({ params }: Props) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect('/sign-in')
  }

  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <PageShell titleKey="page.editProductTitle" subtitleKey="page.editProductSubtitle">
      <ProductForm
        productId={id}
        product={{
          name: product.name,
          category: product.category ?? '',
          supplierId: product.supplierId ?? '',
          fastMoving: product.fastMoving,
          trackExpiry: product.trackExpiry,
          active: product.active,
          types: product.types.map((type) => ({ ...type, buyingPricePerUnit: Number(type.buyingPricePerUnit), sellingPricePerUnit: Number(type.sellingPricePerUnit) })),
        }}
      />
    </PageShell>
  )
}
