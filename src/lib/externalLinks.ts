import { Alert, Linking } from 'react-native'

import * as StoreReview from 'expo-store-review'
import * as WebBrowser from 'expo-web-browser'

import { env } from './env'

export type LegalDocument = 'privacy' | 'terms' | 'kvkk'

const LEGAL_URLS: Record<LegalDocument, string> = {
  privacy: env.EXPO_PUBLIC_PRIVACY_URL,
  terms: env.EXPO_PUBLIC_TERMS_URL,
  kvkk: env.EXPO_PUBLIC_KVKK_URL,
}

const OPEN_FAILED_TITLE = 'Açılamadı'

function showOpenFailed(message: string): void {
  Alert.alert(OPEN_FAILED_TITLE, message)
}

export async function openLegalDocument(document: LegalDocument): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(LEGAL_URLS[document])
  } catch {
    showOpenFailed('Sayfa açılamadı. Lütfen daha sonra tekrar deneyin.')
  }
}

export async function openSupportEmail(): Promise<void> {
  const subject = encodeURIComponent('PsikoAl Destek')
  const url = `mailto:${env.EXPO_PUBLIC_SUPPORT_EMAIL}?subject=${subject}`
  try {
    await Linking.openURL(url)
  } catch {
    showOpenFailed(
      `E-posta uygulaması açılamadı. Bize ${env.EXPO_PUBLIC_SUPPORT_EMAIL} adresinden ulaşabilirsiniz.`
    )
  }
}

export async function openNotificationSettings(): Promise<void> {
  try {
    await Linking.openSettings()
  } catch {
    showOpenFailed('Ayarlar açılamadı. Bildirim izinlerini cihaz ayarlarından düzenleyebilirsiniz.')
  }
}

export async function requestStoreReview(): Promise<void> {
  try {
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview()
      return
    }
    if (env.EXPO_PUBLIC_STORE_URL) {
      await Linking.openURL(env.EXPO_PUBLIC_STORE_URL)
      return
    }
  } catch {
    // Aşağıdaki bilgilendirme gösterilir.
  }
  showOpenFailed('Değerlendirme penceresi şu an açılamıyor. Lütfen daha sonra tekrar deneyin.')
}

export function openPhone(phone: string): void {
  Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() =>
    showOpenFailed('Arama başlatılamadı.')
  )
}

export function openEmail(email: string): void {
  Linking.openURL(`mailto:${email}`).catch(() => showOpenFailed('E-posta uygulaması açılamadı.'))
}

/** Uygulama içi tarayıcıda bir adres açar (ör. imzalı fatura PDF'i). */
export async function openWebUrl(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url)
  } catch {
    showOpenFailed('Sayfa açılamadı. Lütfen daha sonra tekrar deneyin.')
  }
}
