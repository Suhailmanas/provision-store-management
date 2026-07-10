'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const message =
    process.env.NODE_ENV === 'development'
      ? error.message || 'An unexpected application error occurred.'
      : 'An unexpected application error occurred.'

  return (
    <html>
      <body>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">!</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Error</h1>
            <p className="text-slate-600 mb-4">{message}</p>

            <div className="bg-slate-100 p-3 rounded-md mb-6 text-left text-sm">
              <p className="font-semibold text-slate-900 mb-2">What to try:</p>
              <ol className="space-y-1 text-slate-700 text-xs list-decimal list-inside">
                <li>Refresh the page</li>
                <li>Restart the dev server if the error persists</li>
                <li>Check the terminal for the server-side stack trace</li>
              </ol>
            </div>

            <button
              onClick={() => reset()}
              className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
