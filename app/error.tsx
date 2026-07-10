'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-[12px] p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-poppins font-semibold text-foreground mb-2">
          Configuration Error
        </h1>
        <p className="text-muted-foreground mb-6">
          The application is missing required configuration. Please set up the environment variables.
        </p>

        <div className="bg-muted p-4 rounded-md mb-6 text-left text-sm">
          <p className="font-mono text-xs text-muted-foreground mb-2">Required environment variables:</p>
          <ul className="space-y-1 font-mono text-xs">
            <li>• DATABASE_URL</li>
            <li>• BETTER_AUTH_SECRET</li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground mb-6">
          Contact your administrator or check the Vercel project settings to configure these variables.
        </p>

        <button
          onClick={() => reset()}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
