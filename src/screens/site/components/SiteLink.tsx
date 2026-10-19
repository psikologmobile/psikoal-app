import type { ReactNode } from 'react'

import { Pressable } from 'react-native'

import { Link } from 'expo-router'
import type { Href } from 'expo-router'

import { cn } from '@/core/utils/cn'

export type SiteLinkProps = {
  /** Site içi yol ("/destek") ya da dış adres ("mailto:…", "https://…"). */
  href: string
  children: ReactNode
  className?: string
  accessibilityLabel?: string
  /** Gezinme menüsünde bu sayfa mı? (aria-current="page") */
  current?: boolean
  testID?: string
}

/**
 * Sitenin bağlantısı: web'de gerçek <a href> (arama motorları izler, orta tık
 * yeni sekme açar), tıklamada istemci tarafı gezinme. Basma hissi CSS'ten
 * (`site-press`, siteDocument).
 */
export function SiteLink({
  href,
  children,
  className,
  accessibilityLabel,
  current = false,
  testID,
}: SiteLinkProps) {
  return (
    // REASON: typed routes üretilmiş tipleri derleme zamanında yok; yollar SITE_ROUTES'tan gelir
    <Link href={href as Href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={current ? { selected: true } : undefined}
        testID={testID}
        className={cn('site-press', className)}
      >
        {children}
      </Pressable>
    </Link>
  )
}
