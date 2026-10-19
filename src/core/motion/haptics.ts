import { Platform } from 'react-native'

import * as Haptics from 'expo-haptics'

/**
 * Dokunsal geri bildirim kısayolları. Web'de no-op; hatalar yutulur (bazı
 * cihazlarda motor yok).
 */
const isWeb = Platform.OS === 'web'

function run(fn: () => Promise<void>) {
  if (isWeb) return
  fn().catch(() => undefined)
}

export const haptic = {
  /** Düğme, çip, sekme basışı */
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Birincil eylem */
  medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Seçim değişimi (segment, yıldız, stepper) */
  selection: () => run(() => Haptics.selectionAsync()),
  /** Başarı anı (gönderildi, eşleşti, kopyalandı) */
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Hata (shake ile birlikte) */
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  /** Uyarı */
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
} as const

export type HapticKind = keyof typeof haptic
