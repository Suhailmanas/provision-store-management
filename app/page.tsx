import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Dashboard from '@/components/dashboard'

export default async function Home() {
  try {
    const { auth } = await import('@/lib/auth')
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      redirect('/sign-in')
    }

    return <Dashboard />
  } catch (error) {
    // If auth fails, redirect to sign-in
    // This handles missing environment variables gracefully
    redirect('/sign-in')
  }
}
