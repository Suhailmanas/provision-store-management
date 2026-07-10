'use client'

import { useLanguage } from '@/components/language-provider'

export default function Translate({ id }: { id: string }) {
  const { t } = useLanguage()
  return <>{t(id)}</>
}
