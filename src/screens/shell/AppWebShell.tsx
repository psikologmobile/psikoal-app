import type { ReactNode } from 'react'

import { Platform, View } from 'react-native'

import { AppSidebar } from './AppSidebar'

import { useSidebarMode } from '@/core/components/organisms'
import { cn } from '@/core/utils/cn'
import { useAuthStore } from '@/domains/auth'

type AppWebShellProps = { children: ReactNode }

/**
 * Yığın sayfalarının (ilan, teklif, eşleşme, bakiye, bildirimler, ayar alt sayfaları)
 * web kabuğu: oturum açık kullanıcıya sekme sayfalarındakiyle aynı kenar çubuğunu
 * çizer (≤640 px üst menü). Native'de ve oturum yokken (site sayfaları, davet
 * bağlantısı) çocukları olduğu gibi döndürür — native çıktı değişmez.
 */
export function AppWebShell({ children }: AppWebShellProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const mode = useSidebarMode()
  if (Platform.OS !== 'web' || !isAuthenticated) return <>{children}</>
  return (
    <View
      testID="app-web-shell"
      className={cn('flex-1 bg-bg', mode === 'top' ? 'flex-col' : 'flex-row')}
    >
      <AppSidebar />
      <View className="min-w-0 flex-1">{children}</View>
    </View>
  )
}
