'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/components/language-provider'
import LoadingScreen from '@/components/loading-screen'

type AuthFormProps = {
  mode: 'sign-in' | 'sign-up'
  authDisabledMessage?: string
}

export function AuthForm({ mode, authDisabledMessage }: AuthFormProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'
  const authDisabled = Boolean(authDisabledMessage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (authDisabled) {
      setError(authDisabledMessage ?? t('auth.authUnavailable'))
      return
    }

    setError(null)
    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedName = name.trim()

    if (isSignUp && normalizedName.length < 2) {
      setError(t('auth.fullNameRequired'))
      setLoading(false)
      return
    }

    try {
      const result = isSignUp
        ? await authClient.signUp.email({
            email: normalizedEmail,
            password,
            name: normalizedName,
          })
        : await authClient.signIn.email({
            email: normalizedEmail,
            password,
          })

      if (result.error) {
        setError(result.error.message ?? 'Something went wrong')
        return
      }

      router.replace('/')
      router.refresh()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('auth.serverUnavailable')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4">
      {loading && (
        <LoadingScreen message={isSignUp ? 'Creating account...' : 'Signing in...'} />
      )}
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignUp ? t('auth.signUpIntro') : t('auth.signInIntro')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                disabled={authDisabled || loading}
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={authDisabled || loading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              disabled={authDisabled || loading}
            />
          </div>

          {(authDisabledMessage || error) && (
            <p className="text-sm text-destructive" role="alert">
              {error ?? authDisabledMessage}
            </p>
          )}

          <Button type="submit" disabled={loading || authDisabled} className="w-full">
            {loading
              ? t('common.pleaseWait')
              : authDisabled
                ? t('auth.authUnavailable')
                : isSignUp
                  ? t('auth.createAccountButton')
                  : t('auth.signInButton')}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.noAccount')}{' '}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            {isSignUp ? t('auth.signInLink') : t('auth.signUpLink')}
          </Link>
        </p>
      </Card>
    </main>
  )
}
