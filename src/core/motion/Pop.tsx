import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { DURATION, EASE_OUT } from './config'
import { useReduceMotion } from './useReduceMotion'

export type PopProps = {
  children?: ReactNode
  /** Gecikme (ms). Sayaç rozeti 1000, yıldız 0 … */
  delay?: number
  /** Toplam süre (ms), varsayılan 400. */
  duration?: number
  /** Taşma tepe ölçeği, varsayılan 1.12. */
  overshoot?: number
  /** Değişince yeniden oynar (ör. seçim değişti). */
  replayKey?: string | number | boolean
  className?: string
  style?: StyleProp<ViewStyle>
}

/** `pop`: scale 0 → 1.12 → 1. Rozet, seçili tik, başarı ikonu, yıldız. */
export function Pop({
  children,
  delay = 0,
  duration = DURATION.base,
  overshoot = 1.12,
  replayKey,
  className,
  style,
}: PopProps) {
  const reduce = useReduceMotion()
  const scale = useSharedValue(reduce ? 1 : 0)

  useEffect(() => {
    if (reduce) {
      scale.value = 1
      return
    }
    scale.value = 0
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(overshoot, { duration: duration * 0.7, easing: EASE_OUT }),
        withTiming(1, { duration: duration * 0.3, easing: EASE_OUT })
      )
    )
  }, [reduce, delay, duration, overshoot, scale, replayKey])

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const inner = <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  return className ? <View className={className}>{inner}</View> : inner
}
