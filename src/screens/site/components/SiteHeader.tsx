import { useState } from 'react'
import type { ReactNode } from 'react'

import { Pressable, View } from 'react-native'

import { SITE_ROUTES } from '../siteRoutes'

import { SiteLink } from './SiteLink'
import { SITE_WRAP, useSiteScroll } from './SitePage'

import { BrandMark } from '@/core/components/atoms/BrandMark'
import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type SiteNavItem = {
  label: string
  /** Başka sayfa. */
  href?: string
  /** Aynı sayfadaki bölüm (SiteSection id). */
  anchor?: string
  current?: boolean
}

export type SiteHeaderProps = {
  nav?: SiteNavItem[]
  /** Logonun yanındaki hap (ör. "Uzmanlar"). */
  badge?: string
  /** Her genişlikte görünen sağ taraf (ör. tek bağlantı, kullanıcı çipi). */
  actions?: ReactNode
  /** Yalnız geniş ekranda (> 860 px) görünen sağ taraf; dar ekranda menüye taşınır. */
  desktopActions?: ReactNode
  /** Dar ekran menüsünün altındaki ana düğme. */
  menuFooter?: ReactNode
}

const LINK_TEXT = 'font-body-semibold text-[15px] leading-5'

function NavLink({ item, onNavigate }: { item: SiteNavItem; onNavigate?: () => void }) {
  const { scrollToAnchor } = useSiteScroll()
  const box = cn('site-lnk rounded-sm px-3.5 py-2.5', item.current && 'bg-surface')
  const label = (
    <Text className={cn(LINK_TEXT, item.current ? 'text-fg' : 'text-fg-muted')}>{item.label}</Text>
  )
  if (item.anchor) {
    const anchor = item.anchor
    return (
      <Pressable
        accessibilityRole="link"
        className={box}
        onPress={() => {
          onNavigate?.()
          scrollToAnchor(anchor)
        }}
      >
        {label}
      </Pressable>
    )
  }
  return (
    <SiteLink href={item.href ?? SITE_ROUTES.home} className={box} current={item.current}>
      {label}
    </SiteLink>
  )
}

/**
 * Site üst menüsü (b2_Site_*): logo, bağlantılar, sağda eylemler. ≤ 860 px'te
 * bağlantılar ve masaüstü eylemleri gizlenir, hamburger açılır menüyü getirir.
 */
export function SiteHeader({
  nav = [],
  badge,
  actions,
  desktopActions,
  menuFooter,
}: SiteHeaderProps) {
  const colors = useThemeColors()
  const [menuOpen, setMenuOpen] = useState(false)
  const hasMenu = nav.length > 0 || Boolean(menuFooter)

  return (
    <View className={SITE_WRAP}>
      <View className="h-20 flex-row items-center justify-between gap-4">
        <SiteLink
          href={SITE_ROUTES.home}
          accessibilityLabel="Psikosirius ana sayfa"
          className="flex-row items-center gap-2.5"
        >
          <BrandMark asHeader={false} />
          {badge ? (
            <View className="rounded-full bg-accent-soft px-2.5 py-1">
              <Text className="font-body-heavy text-xs text-accent-soft-fg">{badge}</Text>
            </View>
          ) : null}
        </SiteLink>

        {nav.length > 0 ? (
          <View
            role="navigation"
            aria-label="Site menüsü"
            className="hidden flex-row gap-1 min-[861px]:flex"
          >
            {nav.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </View>
        ) : null}

        <View className="flex-row items-center gap-2">
          {desktopActions ? (
            <View className="hidden flex-row items-center gap-2 min-[861px]:flex">
              {desktopActions}
            </View>
          ) : null}
          {actions}
          {hasMenu ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Menü"
              accessibilityState={{ expanded: menuOpen }}
              onPress={() => setMenuOpen((open) => !open)}
              className="site-press h-12 w-12 items-center justify-center rounded-md border border-border-strong min-[861px]:hidden"
            >
              <Icon
                name={menuOpen ? 'X' : 'Menu'}
                size={20}
                color={colors.text}
                strokeWidth={2.4}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      {menuOpen && hasMenu ? (
        <View
          role="navigation"
          aria-label="Mobil menü"
          className="site-dp mb-3 gap-1 rounded-card border border-border p-2.5 min-[861px]:hidden"
        >
          {nav.map((item) => (
            <NavLink key={item.label} item={item} onNavigate={() => setMenuOpen(false)} />
          ))}
          {menuFooter}
        </View>
      ) : null}
    </View>
  )
}
