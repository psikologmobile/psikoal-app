import type { NavIconName } from '@/core/components/atoms/NavIcon'

export type AppRole = 'expert' | 'client'

export type AppNavKey = 'index' | 'offers' | 'matches' | 'notifications' | 'wallet' | 'profile'

export type AppNavEntry = {
  key: AppNavKey
  label: string
  icon: NavIconName
  /** Expo Router hedefi (sekmeler `(tabs)` grubunda). */
  href: string
}

/** Web kenar çubuğu öğeleri, role göre sırasıyla (tasarım: b1_Web_* `aside.side`). */
export const APP_NAV: Record<AppRole, AppNavEntry[]> = {
  client: [
    { key: 'index', label: 'Keşfet', icon: 'discover', href: '/(tabs)' },
    { key: 'offers', label: 'İlanlarım', icon: 'listings', href: '/(tabs)/offers' },
    { key: 'matches', label: 'Eşleşmeler', icon: 'matches', href: '/(tabs)/matches' },
    { key: 'notifications', label: 'Bildirimler', icon: 'notifications', href: '/notifications' },
    { key: 'profile', label: 'Ayarlar', icon: 'settings', href: '/(tabs)/profile' },
  ],
  expert: [
    { key: 'index', label: 'Fırsatlar', icon: 'opportunities', href: '/(tabs)' },
    { key: 'offers', label: 'Tekliflerim', icon: 'offers', href: '/(tabs)/offers' },
    { key: 'matches', label: 'Eşleşmeler', icon: 'matches', href: '/(tabs)/matches' },
    { key: 'wallet', label: 'Bakiyem', icon: 'balance', href: '/wallet' },
    { key: 'profile', label: 'Ayarlar', icon: 'settings', href: '/(tabs)/profile' },
  ],
}

/**
 * Geçerli yol hangi kenar çubuğu öğesini vurgular. Yığın sayfaları (ilan, teklif,
 * eşleşme, ayar alt sayfaları) ait oldukları sekmeyi işaretler; eşleşme yoksa null.
 */
export function resolveActiveNavKey(pathname: string, role: AppRole): AppNavKey | null {
  const path = pathname.replace(/\/+$/, '') || '/'
  const is = (prefix: string) => path === prefix || path.startsWith(`${prefix}/`)
  const isExpert = role === 'expert'

  if (path === '/') return 'index'
  if (is('/offers')) return 'offers'
  if (is('/matches') || is('/match')) return 'matches'
  if (is('/profile') || is('/referral')) return 'profile'
  if (is('/wallet')) return isExpert ? 'wallet' : null
  if (is('/notifications')) return isExpert ? null : 'notifications'
  if (path === '/listing/new') return null
  if (is('/listing')) return isExpert ? 'index' : 'offers'
  if (path === '/offer/new') return isExpert ? 'index' : null
  if (is('/offer')) return 'offers'
  if (is('/claim')) return isExpert ? null : 'offers'
  if (is('/assessment') || is('/expert')) return isExpert ? null : 'index'
  return null
}
