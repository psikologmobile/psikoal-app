import { Platform } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'

import * as SecureStore from 'expo-secure-store'

import type { StateStorage } from 'zustand/middleware'

/**
 * Web derlemesi (static output) sayfaları Node'da önceden çizer: orada `window` ve
 * localStorage yoktur. Depo okumaları sunucuda boş döner, yazmalar yok sayılır;
 * böylece zustand persist ve token okumaları statik çizimi düşürmez.
 */
const isServerRender = Platform.OS === 'web' && typeof window === 'undefined'

export const zustandStorage: StateStorage = {
  getItem: (key) => (isServerRender ? null : AsyncStorage.getItem(key)),
  setItem: (key, value) => (isServerRender ? undefined : AsyncStorage.setItem(key, value)),
  removeItem: (key) => (isServerRender ? undefined : AsyncStorage.removeItem(key)),
}

type SecureBackend = {
  getItemAsync: (key: string) => Promise<string | null>
  setItemAsync: (key: string, value: string) => Promise<void>
  deleteItemAsync: (key: string) => Promise<void>
}

/**
 * expo-secure-store'un web uygulaması YOK (çağrı TypeError verir). Web'de token
 * tarayıcının localStorage'ındadır — tarayıcıda Keychain eşdeğeri yok; XSS'e karşı
 * koruma sitenin CSP/başlıklarıyla (render.yaml) sağlanır.
 */
const webSecureBackend: SecureBackend = {
  getItemAsync: async (key) => {
    if (isServerRender) return null
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItemAsync: async (key, value) => {
    if (isServerRender) return
    window.localStorage.setItem(key, value)
  },
  deleteItemAsync: async (key) => {
    if (isServerRender) return
    window.localStorage.removeItem(key)
  },
}

const secureBackend: SecureBackend = Platform.OS === 'web' ? webSecureBackend : SecureStore

// Oturum token'ları şifreli depoda (iOS Keychain / Android Keystore) tutulur.
// AsyncStorage şifresizdir ve yedeklere girer; token orada durmamalı.
const ACCESS_TOKEN_KEY = 'psikoal.accessToken'
const REFRESH_TOKEN_KEY = 'psikoal.refreshToken'

// Eski sürümlerin AsyncStorage anahtarları — yalnız tek seferlik taşıma için.
export const LEGACY_TOKEN_KEYS = {
  access: 'auth.accessToken',
  refresh: 'auth.refreshToken',
} as const

/**
 * Eski sürümden kalan token'ları AsyncStorage'dan şifreli depoya taşır ve
 * eskilerini siler. Kullanıcı güncellemeden sonra oturumu kaybetmez.
 * Şifreli depoda zaten değer varsa o kazanır (daha yenidir).
 */
export async function migrateLegacyTokens(): Promise<void> {
  const entries = await AsyncStorage.multiGet([LEGACY_TOKEN_KEYS.access, LEGACY_TOKEN_KEYS.refresh])
  const legacyAccess = entries[0]?.[1] ?? null
  const legacyRefresh = entries[1]?.[1] ?? null
  if (legacyAccess == null && legacyRefresh == null) return

  if (legacyAccess != null && (await secureBackend.getItemAsync(ACCESS_TOKEN_KEY)) == null) {
    await secureBackend.setItemAsync(ACCESS_TOKEN_KEY, legacyAccess)
  }
  if (legacyRefresh != null && (await secureBackend.getItemAsync(REFRESH_TOKEN_KEY)) == null) {
    await secureBackend.setItemAsync(REFRESH_TOKEN_KEY, legacyRefresh)
  }

  await AsyncStorage.multiRemove([LEGACY_TOKEN_KEYS.access, LEGACY_TOKEN_KEYS.refresh])
}

// Taşıma uygulama ömründe bir kez, ilk token okumasından ÖNCE çalışır.
// Başarısız olursa oturum düşer ama uygulama açılmaya devam eder.
let migration: Promise<void> | null = null
function ensureMigrated(): Promise<void> {
  migration ??= migrateLegacyTokens().catch(() => undefined)
  return migration
}

export const tokenStorage = {
  getAccessToken: async () => {
    await ensureMigrated()
    return secureBackend.getItemAsync(ACCESS_TOKEN_KEY)
  },
  setAccessToken: (token: string) => secureBackend.setItemAsync(ACCESS_TOKEN_KEY, token),
  getRefreshToken: async () => {
    await ensureMigrated()
    return secureBackend.getItemAsync(REFRESH_TOKEN_KEY)
  },
  setRefreshToken: (token: string) => secureBackend.setItemAsync(REFRESH_TOKEN_KEY, token),
  clearTokens: async () => {
    await Promise.all([
      secureBackend.deleteItemAsync(ACCESS_TOKEN_KEY),
      secureBackend.deleteItemAsync(REFRESH_TOKEN_KEY),
      AsyncStorage.multiRemove([LEGACY_TOKEN_KEYS.access, LEGACY_TOKEN_KEYS.refresh]),
    ])
  },
}

export async function storageGet<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key)
  if (raw == null) return null
  try {
    // REASON: çağıran, anahtarı kendisi yazdığı tiple okur; JSON.parse unknown döner
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value))
}

export async function storageRemove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key)
}
