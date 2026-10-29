import { View } from 'react-native'

import { SITE_ROUTES } from '../siteRoutes'

import { SiteLink } from './SiteLink'
import { SITE_WRAP } from './SitePage'

import { Text } from '@/core/components/atoms/Text'

const FULL_LINKS = [
  { label: 'Gizlilik', href: SITE_ROUTES.privacy },
  { label: 'Kullanım koşulları', href: SITE_ROUTES.terms },
  { label: 'KVKK', href: SITE_ROUTES.kvkk },
  { label: 'Mesafeli satış', href: SITE_ROUTES.distanceSales },
  { label: 'Destek', href: SITE_ROUTES.support },
  { label: 'Uzmanlar için', href: SITE_ROUTES.experts },
] as const

const COMPACT_LINKS = [
  { label: 'Gizlilik', href: SITE_ROUTES.privacy },
  { label: 'Koşullar', href: SITE_ROUTES.terms },
  { label: 'Mesafeli satış', href: SITE_ROUTES.distanceSales },
  { label: 'Destek', href: SITE_ROUTES.support },
] as const

export type SiteFooterProps = {
  /** full: tanıtım (marka + açıklama + 6 bağlantı) · compact: diğer sayfalar. */
  variant?: 'full' | 'compact'
}

/** Site alt bilgisi (tasarım: Tanıtım ve Uzmanlar için alt kısmı). */
export function SiteFooter({ variant = 'compact' }: SiteFooterProps) {
  const links = variant === 'full' ? FULL_LINKS : COMPACT_LINKS
  return (
    <View
      className={variant === 'full' ? 'mt-10 border-t border-border' : 'border-t border-border'}
    >
      <View
        className={`${SITE_WRAP} flex-row flex-wrap justify-between ${variant === 'full' ? 'gap-6 py-10' : 'gap-4 py-8'}`}
      >
        {variant === 'full' ? (
          <View className="max-w-[320px] gap-2">
            <Text className="font-display text-[22px] leading-7 text-fg">Psikosirius</Text>
            <Text className="text-body-sm text-fg-muted">
              Danışanlarla lisanslı uzmanları buluşturan platform.
            </Text>
          </View>
        ) : (
          <Text className="font-body-bold text-body-sm text-fg">Psikosirius</Text>
        )}
        <View
          role="navigation"
          aria-label="Alt menü"
          className="flex-row flex-wrap gap-x-4.5 gap-y-1.5"
        >
          {links.map((link) => (
            <SiteLink key={link.href} href={link.href}>
              <Text className="font-body-semibold text-body-sm text-fg">{link.label}</Text>
            </SiteLink>
          ))}
        </View>
      </View>
    </View>
  )
}
