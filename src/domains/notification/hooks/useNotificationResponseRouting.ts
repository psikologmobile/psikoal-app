import { useEffect, useRef } from 'react'

import { Platform } from 'react-native'

import * as Notifications from 'expo-notifications'
import { useRootNavigationState, useRouter } from 'expo-router'

import { resolveNotificationRoute } from '../utils/resolveNotificationRoute'

/**
 * Push bildirimine dokunulduğunda ilgili ekrana gider: uygulama açıkken
 * (listener) ve bildirimle soğuk açıldığında (son yanıt). Oturum yoksa
 * yönlendirme yapılmaz — giriş akışı önceliklidir. Kök gezgin hazır olmadan
 * gezinme denenmez.
 */
export function useNotificationResponseRouting(isAuthenticated: boolean) {
  const router = useRouter()
  const navigationKey = useRootNavigationState()?.key
  const handledIdsRef = useRef(new Set<string>())

  useEffect(() => {
    // Web'de push yok; expo-notifications'ın yanıt API'leri orada tanımsız ve hata fırlatır.
    if (Platform.OS === 'web') return
    if (!isAuthenticated || !navigationKey) return

    const open = (response: Notifications.NotificationResponse | null) => {
      if (!response) return
      const id = response.notification.request.identifier
      if (handledIdsRef.current.has(id)) return
      handledIdsRef.current.add(id)
      const route = resolveNotificationRoute(response.notification.request.content.data)
      // REASON: typed routes dinamik string'i tanımaz; değer resolveNotificationRoute'un sınırlı kümesinden
      router.push(route as never)
    }

    void Notifications.getLastNotificationResponseAsync().then(open)
    const subscription = Notifications.addNotificationResponseReceivedListener(open)
    return () => subscription.remove()
  }, [isAuthenticated, navigationKey, router])
}
