import { useCallback, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { haptic } from './haptics'
import { isReduceMotionEnabled, useReduceMotion } from './useReduceMotion'

/** `shake` adımları: 0 → −7 → 7 → −3 → 0, toplam 450 ms. */
const SHAKE_STEPS = [-7, 7, -3, 0]

/**
 * İmperatif sarsıntı: `const s = useShake(); s.shake()` → `<Animated.View style={s.style}>`.
 */
export function useShake() {
  const x = useSharedValue(0)
  const shake = useCallback(
    (delay = 0) => {
      if (isReduceMotionEnabled()) return
      const step = 450 / SHAKE_STEPS.length
      x.value = withDelay(
        delay,
        withSequence(...SHAKE_STEPS.map((v) => withTiming(v, { duration: step })))
      )
    },
    [x]
  )
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))
  return { style, shake }
}

export type ShakeProps = {
  children?: ReactNode
  /** Her değiştiğinde bir kez sarsılır (ör. hata sayacı, hata mesajı). */
  trigger?: unknown
  /** İlk görünüşte sarsıl (hata kutusu). Varsayılan true. */
  onMount?: boolean
  /** Gecikme (ms), tasarımda 200. */
  delay?: number
  /** Sarsılırken hata haptic'i ver. */
  withHaptic?: boolean
  className?: string
  style?: StyleProp<ViewStyle>
}

/** `shake`: X ±7 px tek sarsıntı, 450 ms. Hata kutuları, bakiye yetersiz. */
export function Shake({
  children,
  trigger,
  onMount = true,
  delay = 200,
  withHaptic = false,
  className,
  style,
}: ShakeProps) {
  const { style: shakeStyle, shake } = useShake()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      if (!onMount) return
    }
    if (withHaptic) haptic.error()
    shake(delay)
  }, [trigger, onMount, delay, withHaptic, shake])

  const inner = <Animated.View style={[shakeStyle, style]}>{children}</Animated.View>
  return className ? <View className={className}>{inner}</View> : inner
}

export type JiggleProps = {
  children?: ReactNode
  /** Kaç kez sallansın (tasarım: kilit ikonu 2 kez). */
  times?: number
  delay?: number
}

/** Kilit ikonu sallanması (`jig`): ±8°, 600 ms, varsayılan 2 kez, 1 sn gecikme. */
export function Jiggle({ children, times = 2, delay = 1000 }: JiggleProps) {
  const reduce = useReduceMotion()
  const r = useSharedValue(0)
  useEffect(() => {
    if (reduce) return
    r.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 150 }),
          withTiming(8, { duration: 300 }),
          withTiming(0, { duration: 150 })
        ),
        times,
        false
      )
    )
  }, [reduce, delay, times, r])
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${r.value}deg` }],
  }))
  return <Animated.View style={[style, { transformOrigin: '50% 30%' }]}>{children}</Animated.View>
}
