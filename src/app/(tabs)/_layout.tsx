import { useEffect } from 'react'

import { Platform } from 'react-native'

import { Tabs } from 'expo-router/js-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'

import type { NavIconName } from '@/core/components/atoms/NavIcon'

import { NavIcon } from '@/core/components/atoms/NavIcon'
import { TabBar, useSidebarMode } from '@/core/components/organisms'
import { size, useThemeColors } from '@/core/theme'
import { useAuthStore } from '@/domains/auth'
import { useExpertApprovalGate } from '@/domains/expert'
import { AppSidebar } from '@/screens/shell'

/** Role göre 4 sekme (docs/design-v2/components.md §4). */
const TABS: Record<'expert' | 'client', Record<string, { title: string; icon: NavIconName }>> = {
  client: {
    index: { title: 'Keşfet', icon: 'discover' },
    offers: { title: 'İlanlarım', icon: 'listings' },
    matches: { title: 'Eşleşmeler', icon: 'matches' },
    profile: { title: 'Ayarlar', icon: 'settings' },
  },
  expert: {
    index: { title: 'Fırsatlar', icon: 'opportunities' },
    offers: { title: 'Tekliflerim', icon: 'offers' },
    matches: { title: 'Eşleşmeler', icon: 'matches' },
    profile: { title: 'Ayarlar', icon: 'settings' },
  },
}

export default function TabsLayout() {
  const router = useRouter()
  const colors = useThemeColors()
  const role = useAuthStore((s) => s.role)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isExpert = role === 'expert'
  const sidebarMode = useSidebarMode()
  const isWeb = Platform.OS === 'web'
  const insets = useSafeAreaInsets()
  // Yüzen sekme çubuğu içeriğin üstüne biner; sahne çubuğun üstünde biter.
  const tabBarReserve = size.tabBar.height + Math.max(size.tabBar.bottom, insets.bottom) + 8

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login')
    }
  }, [isAuthenticated, router])

  // Uzman rolünde olup uzman profili hiç oluşmamış kullanıcı (onboarding yarıda
  // kalmış) uygulamayı kullanamaz: teklif göndermeye kalkınca EXPERT_NOT_FOUND
  // alır. Profil tamamlamaya geri gönderilir.
  const { needsOnboarding } = useExpertApprovalGate()
  useEffect(() => {
    if (isAuthenticated && needsOnboarding) {
      router.replace('/(auth)/onboarding/expert')
    }
  }, [isAuthenticated, needsOnboarding, router])

  const tabs = TABS[isExpert ? 'expert' : 'client']

  return (
    <Tabs
      tabBar={(props) => (isWeb ? <AppSidebar /> : <TabBar {...props} />)}
      screenOptions={{
        headerShown: false,
        tabBarPosition: isWeb ? (sidebarMode === 'top' ? 'top' : 'left') : 'bottom',
        sceneStyle: {
          backgroundColor: colors.bg,
          paddingBottom: isWeb ? 0 : tabBarReserve,
        },
      }}
    >
      {(['index', 'offers', 'matches', 'profile'] as const).map((name) => {
        const tab = tabs[name]
        if (!tab) return null
        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color }) => <NavIcon name={tab.icon} color={color} />,
            }}
          />
        )
      })}
    </Tabs>
  )
}
