"use client"

import Link from 'next/link'
import { useLanguage } from './language-provider'

export default function TranslatedLink({
  href,
  className,
  labelKey,
}: {
  href: string
  className?: string
  labelKey: string
}) {
  const { t } = useLanguage()
  return (
    <Link href={href} className={className}>
      {t(labelKey)}
    </Link>
  )
}
