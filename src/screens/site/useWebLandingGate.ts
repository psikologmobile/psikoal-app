import { useEffect } from 'react'

import { Platform } from 'react-native'

import { usePathname } from 'expo-router'

import { SESSION_ATTRIBUTE } from './siteDocument'
import { useSiteSession } from './useSiteSession'

/**
 * (tabs) düzeninin web kapısı:
 * - `app`: uygulama sekmeleri (native'de her zaman; web'de oturum açıkken).
 * - `landing`: web'de oturumsuz ziyaretçi `/` adresinde → tanıtım sayfası (statik HTML).
 * - `wait`: web'de oturum deposu henüz okunmadı (sekme adresleri) → boş.
 * - `login`: web'de oturum yok (sekme adresleri) → giriş.
 */
export type WebLandingGate = 'app' | 'landing' | 'wait' | 'login'

export function useWebLandingGate(): WebLandingGate {
  const pathname = usePathname()
  const { hydrated, isAuthenticated } = useSiteSession()
  const isWeb = Platform.OS === 'web'

  // Kayıtlı oturum geçersiz çıktıysa (çıkış, 401) tanıtımı gizleyen bayrak kalkar.
  useEffect(() => {
    if (!isWeb || !hydrated || isAuthenticated || typeof document === 'undefined') return
    document.documentElement.removeAttribute(SESSION_ATTRIBUTE)
  }, [isWeb, hydrated, isAuthenticated])

  if (!isWeb || isAuthenticated) return 'app'
  if (pathname === '/') return 'landing'
  return hydrated ? 'login' : 'wait'
}
