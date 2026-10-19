import { useEffect } from 'react'

import { Platform } from 'react-native'

import { Redirect, Stack, useGlobalSearchParams, useSegments } from 'expo-router'

import { useAuthStore } from '@/domains/auth'
import { isSafeReturnPath } from '@/screens/site/siteRoutes'
import { useOnboardingStore } from '@/store/onboardingStore'

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasSeenWelcome = useOnboardingStore((s) => s.hasSeenWelcome)
  const hasHydrated = useOnboardingStore((s) => s.hasHydrated)
  const onboardIntent = useOnboardingStore((s) => s.onboardIntent)
  const clearOnboardIntent = useOnboardingStore((s) => s.clearOnboardIntent)
  const segments = useSegments()
  // Web sitesinden gelen giriş (ör. /bakiye → /login?returnTo=/bakiye): girişten sonra
  // yalnız sitenin kendi yoluna dönülür (açık yönlendirme önlemi).
  const { returnTo } = useGlobalSearchParams<{ returnTo?: string }>()

  // .at(1) kullanılıyor çünkü expo-router'ın typedRoutes tipleri `.expo/types/` altında
  // ÜRETİLİR ve gitignore'dadır. Temiz bir CI klonunda segments `[string]` tuple'ına düşer
  // ve `segments[1]` derleme hatası verir. `.at()` her iki durumda da `string | undefined`.
  const current: string | undefined = segments.at(1)

  useEffect(() => {
    if (current === 'onboarding' && onboardIntent) clearOnboardIntent()
  }, [current, onboardIntent, clearOnboardIntent])

  // Şifre sıfırlama bağlantısı oturum durumundan bağımsız açılabilmeli.
  const isPasswordReset = current === 'reset-password'
  // Kayıt sonrası onboarding oturum açılmışken gösterilir.
  const isPostRegister = current === 'onboarding'

  if (isAuthenticated && !isPostRegister && !isPasswordReset) {
    if (onboardIntent) {
      return <Redirect href={onboardIntent as never} />
    }
    // REASON: returnTo çalışma anında doğrulanmış site yolu; typed routes onu bilemez
    if (isSafeReturnPath(returnTo)) return <Redirect href={returnTo as never} />
    return <Redirect href="/(tabs)" />
  }

  if (
    // Web'de karşılama turu yok: tanıtım sitesi aynı işi görür.
    Platform.OS !== 'web' &&
    !isAuthenticated &&
    hasHydrated &&
    !hasSeenWelcome &&
    current !== 'welcome' &&
    !isPasswordReset
  ) {
    return <Redirect href="/(auth)/welcome" />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
