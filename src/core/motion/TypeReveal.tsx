import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { View } from 'react-native'

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import { useReduceMotion } from './useReduceMotion'

import { cn } from '@/core/utils/cn'

export type TypeRevealProps = {
  children?: ReactNode
  /** Süre (ms), tasarımda 1200. */
  duration?: number
  /** Gecikme (ms), tasarımda 400. */
  delay?: number
  /** Örtünün rengi — metnin durduğu zeminle aynı olmalı (bg-bg, bg-surface …). */
  maskClassName?: string
  className?: string
}

/**
 * `type-reveal`: metin soldan sağa açılır (CSS `clip-path: inset(0 100% 0 0)`
 * karşılığı). RN'de clip-path yok: zemin renginde bir örtü sağa kayarak metni
 * açar; satırlar kırılmadan, hepsi birlikte görünür (teklif notu).
 */
export function TypeReveal({
  children,
  duration = 1200,
  delay = 400,
  maskClassName = 'bg-bg',
  className,
}: TypeRevealProps) {
  const reduce = useReduceMotion()
  const [width, setWidth] = useState(0)
  const progress = useSharedValue(reduce ? 1 : 0)

  useEffect(() => {
    if (reduce) {
      progress.value = 1
      return
    }
    if (width === 0) return
    progress.value = 0
    // steps(40) yerine yumuşak doğrusal: daktilo hissi, RN'de basamaklı eğri yok.
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.linear }))
  }, [reduce, width, delay, duration, progress])

  const maskStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * width }],
  }))

  return (
    <View
      className={cn('overflow-hidden', className)}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {children}
      {reduce ? null : (
        <Animated.View
          pointerEvents="none"
          accessibilityElementsHidden
          style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, maskStyle]}
        >
          <View className={cn('flex-1', maskClassName)} />
        </Animated.View>
      )}
    </View>
  )
}
