'use client'

type LoadingScreenProps = {
  message?: string
}

export default function LoadingScreen({ message = 'Please wait...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="flex min-h-[140px] w-full max-w-sm flex-col items-center justify-center gap-4 rounded-3xl bg-white/95 p-6 text-center shadow-2xl shadow-slate-950/20 backdrop-blur">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
        <p className="text-sm font-semibold text-slate-900">{message}</p>
      </div>
    </div>
  )
}
