import { useEffect, useState } from 'react'

import { Redirect, useLocalSearchParams } from 'expo-router'

import { useAuthStore, useReferralStore } from '@/domains/auth'

/**
 * /davet/{code} — uzmanın davet bağlantısı (Revize 2 §7). Kodu kalıcı depoya
 * yazar ve kayda yönlendirir; kayıt formu kodu useRegisterMutation üzerinden
 * gönderir. Oturum açıksa kod yine saklanır ama ana sayfaya dönülür.
 */
export default function ReferralLinkRoute() {
  const { code } = useLocalSearchParams<{ code?: string }>()
  const capture = useReferralStore((s) => s.capture)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [captured, setCaptured] = useState(false)

  useEffect(() => {
    capture(code)
    setCaptured(true)
  }, [capture, code])

  if (!captured) return null
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/register'} />
}
