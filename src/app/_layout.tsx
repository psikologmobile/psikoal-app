import '../../global.css'

import { useCallback, useEffect, useState } from 'react'

import { Platform, View } from 'react-native'

import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque'
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
} from '@expo-google-fonts/figtree'

import { useFonts } from 'expo-font'
import { Stack, useRouter } from 'expo-router'
import type { ErrorBoundaryProps } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'

import { EmptyState } from '@/core/components/molecules/EmptyState'
import { AppProviders } from '@/core/components/templates/AppProviders'
import { useResolvedColorScheme, useThemeColors } from '@/core/theme'
import { useApplyThemePreference } from '@/core/theme/useApplyThemePreference'
import '@/domains/notification/pushNotificationHandler'
import { useAuthStore, useMeQuery } from '@/domains/auth'
import { useNotificationResponseRouting, useSilentPushRegistration } from '@/domains/notification'
import { registerUnauthenticatedHandler } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { AnimatedSplash, useAppHydrated } from '@/screens/splash'
import { useThemeStore } from '@/store/themeStore'

SplashScreen.preventAutoHideAsync()

// Kök hata sınırı: yakalanmamış bir render hatası beyaz ekran yerine Türkçe bir
// açıklama ve yeniden deneme gösterir. Sağlayıcıların DIŞINDA çizildiği için
// yalnız sağlayıcı gerektirmeyen bileşenler kullanılır.
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 bg-bg">
      <EmptyState
        icon="AlertTriangle"
        title="Bir şeyler ters gitti"
        description="Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
        ctaLabel="Tekrar Dene"
        onCta={() => void retry()}
      />
    </View>
  )
}

// Oturumla ilgili arka plan senkronizasyonu; sağlayıcıların İÇİNDE çalışmak
// zorunda (TanStack Query). Görsel çıktısı yok.
function SessionSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const userId = useAuthStore((s) => s.userId)
  useMeQuery()
  // İzin önceden verilmişse token her girişte/açılışta tazelenir; izin İSTENMEZ.
  useSilentPushRegistration(isAuthenticated ? userId : null)
  useNotificationResponseRouting(isAuthenticated)
  return null
}

export default function RootLayout() {
  const router = useRouter()
  const preference = useThemeStore((s) => s.preference)
  useApplyThemePreference(preference)
  const colors = useThemeColors()
  const scheme = useResolvedColorScheme()
  const hydrated = useAppHydrated()
  // Açılış animasyonu yalnız soğuk açılışta: kök düzen bir kez bağlanır.
  // Web'de açılış katmanı yok: sayfalar statik HTML olarak gelir (SEO) ve katman
  // içeriği örterdi; hidrasyon sırasında yönlendirmeleri kök/sekme düzenleri yönetir.
  const [splashDone, setSplashDone] = useState(Platform.OS === 'web')
  const finishSplash = useCallback(() => setSplashDone(true), [])

  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  })

  // Yerel açılış ekranı yazı tipleri gelince kalkar; yerini aynı renkteki
  // AnimatedSplash alır (yazı tipi gerektirdiği için önce yüklenmeleri beklenir).
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  useEffect(() => {
    registerUnauthenticatedHandler(() => {
      // clearAuth ÖNCE çağrılmalı — yoksa (auth)/_layout.tsx hâlâ isAuthenticated=true
      // görüp /(tabs)'a geri yönlendirir, orada fetch yine 401 alır: sonsuz döngü.
      useAuthStore.getState().clearAuth()
      // Önceki kullanıcının önbellekteki verisi bir sonraki girişte görünmesin.
      queryClient.clear()
      router.replace('/(auth)/login')
    })
  }, [router])

  if (!fontsLoaded && !fontError) return null

  return (
    <AppProviders>
      <SessionSync />
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
      {splashDone ? null : <AnimatedSplash ready={hydrated} onDone={finishSplash} />}
    </AppProviders>
  )
}
