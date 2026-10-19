import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { View } from 'react-native'

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import { EASE_OUT } from './config'
import { useReduceMotion } from './useReduceMotion'

export type FlashProps = {
  children?: ReactNode
  /** Değişince yeniden oynar (ör. yeni ücret etiketi). */
  replayKey?: string | number | boolean
  /** Başlangıç ölçeği, varsayılan 1.25. */
  from?: number
  delay?: number
  duration?: number
  className?: string
}

/**
 * `flash`: yeni değer 1.25 → 1 ölçeğinden oturur (600 ms). Teklif gönder ekranında
 * ücret değiştiğinde. Sol kenardan büyür (transformOrigin sol orta).
 */
export function Flash({
  children,
  replayKey,
  from = 1.25,
  delay = 300,
  duration = 600,
  className,
}: FlashProps) {
  const reduce = useReduceMotion()
  const scale = useSharedValue(1)

  useEffect(() => {
    if (reduce) {
      scale.value = 1
      return
    }
    scale.value = from
    scale.value = withDelay(delay, withTiming(1, { duration, easing: EASE_OUT }))
  }, [reduce, replayKey, from, delay, duration, scale])

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const inner = (
    <Animated.View style={[style, { transformOrigin: 'left center' }]}>{children}</Animated.View>
  )
  return className ? <View className={className}>{inner}</View> : inner
}
