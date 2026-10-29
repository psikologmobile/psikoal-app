import { useCallback, useEffect, useRef } from 'react'

import { Platform } from 'react-native'

import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'

import { useRegisterPushTokenMutation } from '../api/useRegisterPushTokenMutation'

import { rememberPushToken } from '@/lib/pushToken'

type RegisterOptions = {
  /** true: izin yoksa sistem izin penceresi açılır. false: yalnız izin zaten varsa kaydeder. */
  prompt: boolean
}

function readProjectId(): string | undefined {
  const extra: unknown = Constants.expoConfig?.extra
  if (typeof extra !== 'object' || extra === null || !('eas' in extra)) return undefined
  const eas: unknown = extra.eas
  if (typeof eas !== 'object' || eas === null || !('projectId' in eas)) return undefined
  return typeof eas.projectId === 'string' ? eas.projectId : undefined
}

/**
 * Push token'ı alır ve backend'e kaydeder. Döndürdüğü fonksiyon her çağrıldığında
 * izin durumunu yeniden kontrol eder; hata yutulur (simülatör, Expo Go vb.).
 */
export function usePushRegistration(): (options: RegisterOptions) => Promise<void> {
  const { mutateAsync: registerToken } = useRegisterPushTokenMutation()

  return useCallback(
    async ({ prompt }: RegisterOptions) => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Genel Bildirimler',
            importance: Notifications.AndroidImportance.DEFAULT,
          })
        }

        let { status } = await Notifications.getPermissionsAsync()
        if (status !== 'granted') {
          if (!prompt) return
          status = (await Notifications.requestPermissionsAsync()).status
        }
        if (status !== 'granted') return

        const projectId = readProjectId()
        const { data: token } = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        )

        await registerToken({ token, platform: Platform.OS === 'ios' ? 'ios' : 'android' })
        await rememberPushToken(token)
      } catch {
        // Push desteklemeyen ortamlarda (simülatör, Expo Go) sessizce geçilir.
      }
    },
    [registerToken]
  )
}

/**
 * Psikosirius kuralı (CLAUDE.md): bildirim izni ilk girişte değil, ilk teklif
 * anında istenir. `enabled` bu anı çağıran ekran belirler; hook o an bir kez
 * izin ister ve token'ı kaydeder.
 */
export function usePushTokenRegistration(enabled: boolean) {
  const register = usePushRegistration()
  const hasRunRef = useRef(false)

  useEffect(() => {
    if (!enabled || hasRunRef.current) return
    hasRunRef.current = true
    void register({ prompt: true })
  }, [enabled, register])
}

/**
 * Açılışta / girişte: izin ÖNCEDEN verilmişse token'ı sessizce (yeniden)
 * kaydeder, izin istemez. Kullanıcı değişince tekrar çalışır.
 */
export function useSilentPushRegistration(userId: string | null) {
  const register = usePushRegistration()
  const lastUserRef = useRef<string | null>(null)

  useEffect(() => {
    if (!userId) {
      lastUserRef.current = null
      return
    }
    if (lastUserRef.current === userId) return
    lastUserRef.current = userId
    void register({ prompt: false })
  }, [userId, register])
}
