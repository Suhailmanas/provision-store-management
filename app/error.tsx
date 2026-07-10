'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const message =
    process.env.NODE_ENV === 'development'
      ? error.message || 'An unexpected error occurred while rendering this page.'
      : 'An unexpected error occurred while rendering this page.'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-[12px] p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">!</div>
        <h1 className="text-2xl font-poppins font-semibold text-foreground mb-2">
          Page Error
        </h1>
        <p className="text-muted-foreground mb-6">{message}</p>

        <div className="bg-muted p-4 rounded-md mb-6 text-left text-sm">
          <p className="font-mono text-xs text-muted-foreground mb-2">What to try:</p>
          <ul className="space-y-1 font-mono text-xs">
            <li>- Refresh the page</li>
            <li>- Restart the dev server if the error persists</li>
            <li>- Check the terminal for the underlying stack trace</li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground mb-6">
          The app will show the actual runtime failure here instead of assuming it is an
          environment problem.
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
