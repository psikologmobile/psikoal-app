import { useEffect, useState } from 'react'

import { useAuthStore } from '@/domains/auth'
import { useOnboardingStore } from '@/store/onboardingStore'

function authHydrated(): boolean {
  return useAuthStore.persist?.hasHydrated?.() ?? true
}

/**
 * Oturum (auth) ve karşılama (onboarding) depoları diskten okundu mu?
 * Açılış katmanı bunlar hazır olana kadar kalır; böylece yönlendirme
 * (karşılama / giriş / sekmeler) kullanıcıya görünmeden tamamlanır.
 */
export function useAppHydrated(): boolean {
  const onboardingHydrated = useOnboardingStore((s) => s.hasHydrated)
  const [auth, setAuth] = useState(authHydrated)

  useEffect(() => {
    if (auth) return
    const unsubscribe = useAuthStore.persist?.onFinishHydration?.(() => setAuth(true))
    // Abonelikten önce bitmiş olabilir.
    if (authHydrated()) setAuth(true)
    return unsubscribe
  }, [auth])

  return auth && onboardingHydrated
}
