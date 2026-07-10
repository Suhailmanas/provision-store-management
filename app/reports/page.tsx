import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import ReportsPage from '@/components/reports-page'
import Navigation from '@/components/navigation'
import PageShell from '@/components/page-shell'

export default async function ReportsRoute() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <PageShell titleKey="page.reportsTitle" subtitleKey="page.reportsSubtitle">
      <ReportsPage />
    </PageShell>
  )
}
