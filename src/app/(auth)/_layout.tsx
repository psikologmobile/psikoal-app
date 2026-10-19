import { useEffect } from 'react'

import { Redirect, Stack, useSegments } from 'expo-router'

import { useAuthStore } from '@/domains/auth'
import { useOnboardingStore } from '@/store/onboardingStore'

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasSeenWelcome = useOnboardingStore((s) => s.hasSeenWelcome)
  const hasHydrated = useOnboardingStore((s) => s.hasHydrated)
  const onboardIntent = useOnboardingStore((s) => s.onboardIntent)
  const clearOnboardIntent = useOnboardingStore((s) => s.clearOnboardIntent)
  const segments = useSegments()

  // .at(1) kullanılıyor çünkü expo-router'ın typedRoutes tipleri `.expo/types/` altında
  // ÜRETİLİR ve gitignore'dadır. Temiz bir CI klonunda segments `[string]` tuple'ına düşer
  // ve `segments[1]` derleme hatası verir. `.at()` her iki durumda da `string | undefined`.
  const current: string | undefined = segments.at(1)

  useEffect(() => {
    if (current === 'onboarding' && onboardIntent) clearOnboardIntent()
  }, [current, onboardIntent, clearOnboardIntent])

  // Şifre sıfırlama bağlantısı oturum durumundan bağımsız açılabilmeli.
  const isPasswordReset = current === 'reset-password'
  // Kayıt sonu "E-postanı onayla" ekranı oturum açılmışken gösterilir; onboarding'e o geçirir.
  const isPostRegister = current === 'onboarding' || current === 'verify-email'

  if (isAuthenticated && !isPostRegister && !isPasswordReset) {
    if (onboardIntent) {
      return <Redirect href={onboardIntent as never} />
    }
    return <Redirect href="/(tabs)" />
  }

  if (
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
