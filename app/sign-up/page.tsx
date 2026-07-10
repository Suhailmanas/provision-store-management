import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { AuthForm } from '@/components/auth-form'

export default async function SignUpPage() {
  const authDisabledMessage = process.env.DATABASE_URL
    ? undefined
    : 'Authentication is not configured yet. Add DATABASE_URL to enable sign up.'

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user) redirect('/')
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    // Allow the user to access the auth form even if session lookup fails.
  }

  return <AuthForm mode="sign-up" authDisabledMessage={authDisabledMessage} />
}
