import { usePathname, useRouter } from 'expo-router'
import type { Href } from 'expo-router'

import { APP_NAV, resolveActiveNavKey } from './appNav'

import { Sidebar, SidebarBalanceCard, SidebarUserCard } from '@/core/components/organisms'
import { getFullName, getInitials } from '@/core/utils/personName'
import { useAuthStore } from '@/domains/auth'
import { useUnreadNotificationCount } from '@/domains/notification'
import { useWalletQuery } from '@/domains/wallet'

/**
 * Web uygulaması kenar çubuğu — sekme düzeni ve yığın sayfaları (AppWebShell) aynı
 * bileşeni kullanır; aktif öğe yoldan çözülür. Yalnız web'de çizilir.
 */
export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const role = useAuthStore((s) => s.role) === 'expert' ? 'expert' : 'client'
  const user = useAuthStore((s) => s.user)
  const unread = useUnreadNotificationCount()
  const { data: wallet } = useWalletQuery()
  const isExpert = role === 'expert'
  const active = resolveActiveNavKey(pathname, role)

  // REASON: APP_NAV yolları sabit ve geçerli rotalardır; typed routes dizgi birleşimini tanımaz.
  const go = (href: string) => router.navigate(href as Href)

  return (
    <Sidebar
      onBrandPress={() => go('/(tabs)')}
      items={APP_NAV[role].map((entry) => ({
        key: entry.key,
        label: entry.label,
        icon: entry.icon,
        active: entry.key === active,
        badge: entry.key === 'notifications' ? unread : undefined,
        onPress: () => go(entry.href),
      }))}
      primaryAction={
        isExpert ? undefined : { label: 'Yeni ilan', onPress: () => go('/listing/new') }
      }
      footer={
        isExpert ? (
          <SidebarBalanceCard
            balanceLabel={wallet?.balanceLabel ?? '—'}
            // Bakiye yükleme YALNIZ web uygulamasında (/bakiye — PayTR); kenar çubuğu
            // yalnız web'de çizildiği için mobil mağaza kuralı ihlal edilmez.
            onAction={() => go('/bakiye')}
          />
        ) : (
          <SidebarUserCard
            initials={getInitials(user) || 'K'}
            name={getFullName(user) || 'Hesabım'}
            roleLabel="Danışan"
          />
        )
      }
    />
  )
}
