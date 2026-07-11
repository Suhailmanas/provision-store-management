import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getProductById } from '@/app/actions/new-products'
import { getVariantsByProduct } from '@/app/actions/variants'
import ProductDetail from '@/components/product-detail'
import Navigation from '@/components/navigation'

export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({
  params,
}: {
  params: { categoryId: string; productId: string }
}) {
  const session = await auth.api.getSession()
  if (!session) redirect('/sign-in')

  const product = await getProductById(params.productId)
  if (!product) redirect(`/categories/${params.categoryId}`)

  const variants = await getVariantsByProduct(params.productId)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 pb-24">
        <div className="px-4 py-6 max-w-6xl mx-auto">
          <ProductDetail
            categoryId={params.categoryId}
            product={product}
            variants={variants}
          />
        </div>
      </div>

      <Navigation />
    </div>
  )
}
