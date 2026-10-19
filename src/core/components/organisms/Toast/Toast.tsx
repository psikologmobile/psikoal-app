import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { AccessibilityInfo, Platform, View } from 'react-native'

import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@/core/components/atoms/Text'
import { DrawCheck, haptic, Pop, usePresence } from '@/core/motion'
import { useThemeColors } from '@/core/theme'

export type ToastKind = 'success' | 'info' | 'error'

export type ToastOptions = {
  kind?: ToastKind
  /** Ekranda kalma süresi (ms), 2600–3000. */
  duration?: number
  /** Alt kenardan uzaklık (px). Varsayılan: sekme çubuğunun üstü (100). */
  bottomOffset?: number
}

type ToastState = { id: number; message: string } & Required<Omit<ToastOptions, 'bottomOffset'>> & {
    bottomOffset?: number
  }

type ToastContextValue = {
  show: (message: string, options?: ToastOptions) => void
  hide: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/** Sağlayıcı dışında çağrılırsa sessiz no-op döner (testler, galeri dışı ekranlar). */
export function useToast(): ToastContextValue {
  return useContext(ToastContext) ?? NOOP
}

const NOOP: ToastContextValue = { show: () => undefined, hide: () => undefined }

function ToastView({ toast, visible }: { toast: ToastState | null; visible: boolean }) {
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const { mounted, progress } = usePresence(visible, { duration: 320 })
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 120 }],
  }))
  if (!mounted || !toast) return null
  const bottom =
    toast.bottomOffset ?? 100 + (Platform.OS === 'web' ? 0 : Math.max(0, insets.bottom - 20))
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: 20, right: 20, bottom, alignItems: 'center' }, style]}
    >
      <View
        accessibilityRole={toast.kind === 'error' ? 'alert' : 'text'}
        accessibilityLiveRegion="polite"
        className="w-full max-w-[440px] flex-row items-center gap-2.5 rounded-lg bg-fg px-4 py-3.5"
      >
        <Pop delay={150}>
          <View
            className={
              toast.kind === 'error'
                ? 'h-[22px] w-[22px] items-center justify-center rounded-full bg-danger-fill'
                : 'h-[22px] w-[22px] items-center justify-center rounded-full bg-primary'
            }
          >
            {toast.kind === 'success' ? (
              <DrawCheck size={12} color={colors.onPrimary} strokeWidth={3.6} delay={250} />
            ) : (
              <Text className="font-body-heavy text-xs text-primary-fg">
                {toast.kind === 'error' ? '!' : 'i'}
              </Text>
            )}
          </View>
        </Pop>
        <Text className="flex-1 font-body-semibold text-body-sm text-bg">{toast.message}</Text>
      </View>
    </Animated.View>
  )
}

/**
 * ToastProvider — `toast`: alttan kayar, 2,6–3 sn kalır, çıkar. text zemin /
 * bg yazı + primary nokta. Kaydet geri bildirimleri.
 *
 *   const toast = useToast(); toast.show('Bilgilerin kaydedildi')
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seq = useRef(0)

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setVisible(false)
  }, [])

  const show = useCallback((message: string, options: ToastOptions = {}) => {
    seq.current += 1
    const next: ToastState = {
      id: seq.current,
      message,
      kind: options.kind ?? 'success',
      duration: options.duration ?? 2600,
      bottomOffset: options.bottomOffset,
    }
    setToast(next)
    setVisible(true)
    if (next.kind === 'error') haptic.error()
    else haptic.success()
    AccessibilityInfo.announceForAccessibility?.(message)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisible(false), next.duration)
  }, [])

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const value = useMemo(() => ({ show, hide }), [show, hide])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastView key={toast?.id} toast={toast} visible={visible} />
    </ToastContext.Provider>
  )
}
