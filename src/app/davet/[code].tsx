import { useEffect, useState } from 'react'

import { Platform } from 'react-native'

import { Redirect, useLocalSearchParams } from 'expo-router'

import { useAuthStore, useReferralStore } from '@/domains/auth'
import { InviteScreen } from '@/screens/site'

/**
 * /davet/{code} — uzmanın davet bağlantısı (Revize 2 §7). Kodu kalıcı depoya
 * yazar; kayıt formu kodu useRegisterMutation üzerinden gönderir.
 * Web: daveti anlatan site sayfası ("Hesap oluştur"). Mobil: doğrudan kayda
 * (oturum açıksa ana sayfaya) yönlendirir.
 */
export default function ReferralLinkRoute() {
  const { code } = useLocalSearchParams<{ code?: string }>()
  const capture = useReferralStore((s) => s.capture)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [captured, setCaptured] = useState<boolean | null>(null)

  useEffect(() => {
    setCaptured(capture(code))
  }, [capture, code])

  if (Platform.OS === 'web') return <InviteScreen captured={captured} />
  if (captured === null) return null
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/register'} />
}
