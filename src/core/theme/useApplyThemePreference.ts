import { useEffect } from 'react'

import { Platform } from 'react-native'

import { useColorScheme } from 'nativewind'

export type ThemePreferenceValue = 'light' | 'dark' | 'system'

/**
 * Kullanıcının tema tercihini (açık/koyu/sistem) NativeWind'e uygular.
 *
 * Native: `setColorScheme('system')` Appearance'ı sisteme bırakır.
 * Web: `darkMode: 'class'` modunda "sistem" seçilince <html> sınıfı kaldırılır ve
 * koyu sistem temasında da açık görünürdü; bu yüzden web'de sistem tercihi
 * matchMedia ile çözülüp açıkça 'light' / 'dark' verilir ve değişiklik dinlenir.
 */
export function useApplyThemePreference(preference: ThemePreferenceValue) {
  const { setColorScheme } = useColorScheme()

  useEffect(() => {
    if (Platform.OS === 'web' && preference === 'system' && typeof window !== 'undefined') {
      const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
      const apply = () => setColorScheme(mq?.matches ? 'dark' : 'light')
      apply()
      mq?.addEventListener?.('change', apply)
      return () => mq?.removeEventListener?.('change', apply)
    }
    setColorScheme(preference)
    return undefined
  }, [preference, setColorScheme])
}
