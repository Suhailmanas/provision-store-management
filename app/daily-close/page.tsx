import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import DailyCloseForm from '@/components/daily-close-form'
import Navigation from '@/components/navigation'
import PageShell from '@/components/page-shell'

export default async function DailyClosePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <PageShell titleKey="page.dailyCloseTitle" subtitleKey="page.dailyCloseSubtitle">
      <DailyCloseForm />
    </PageShell>
  )
}
