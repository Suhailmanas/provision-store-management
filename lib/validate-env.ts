/**
 * Runtime validation for required environment variables
 * This ensures the app works properly in production
 */

export function validateEnvironment() {
  const errors: string[] = []

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is not set')
  }

  // Check BETTER_AUTH_SECRET (only in production)
  if (process.env.NODE_ENV === 'production' && !process.env.BETTER_AUTH_SECRET) {
    errors.push('BETTER_AUTH_SECRET is not set in production')
  }

  if (errors.length > 0) {
    console.error('[Manas Store] Environment validation failed:')
    errors.forEach((error) => {
      console.error(`  - ${error}`)
    })
    console.error('\nSetup instructions:')
    console.error('1. Generate a BETTER_AUTH_SECRET: openssl rand -base64 32')
    console.error('2. Add it to your Vercel project settings under Environment Variables')
    console.error('3. Redeploy your application')
  }

  return errors.length === 0
}

