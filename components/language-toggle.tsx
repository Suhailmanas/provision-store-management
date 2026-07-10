'use client'

import { useLanguage } from '@/components/language-provider'

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="fixed top-4 right-4 z-50 rounded-full border border-border bg-card/95 p-1 shadow-sm backdrop-blur">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            language === 'en'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('language.english')}
        </button>
        <button
          type="button"
          onClick={() => setLanguage('ta')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            language === 'ta'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('language.tamil')}
        </button>
      </div>
    </div>
  )
}
