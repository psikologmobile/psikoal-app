import { useEffect } from 'react'

import { View } from 'react-native'

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import { EASE_OUT } from './config'
import { useReduceMotion } from './useReduceMotion'

import { cn } from '@/core/utils/cn'

/** 0..1 arası değere yumuşakça ilerleyen paylaşılan değer (`fill`, `cell-rise` …). */
export function useAnimatedProgress(value: number, { duration = 600, delay = 0 } = {}) {
  const reduce = useReduceMotion()
  const clamped = Math.max(0, Math.min(1, value))
  const v = useSharedValue(reduce ? clamped : 0)
  useEffect(() => {
    if (reduce) {
      v.value = clamped
      return
    }
    v.value = withDelay(delay, withTiming(clamped, { duration, easing: EASE_OUT }))
  }, [reduce, clamped, duration, delay, v])
  return v
}

export type FillProps = {
  /** 0..1 */
  value: number
  /** Dolgu rengi (bg-primary). */
  className?: string
  duration?: number
  delay?: number
}

/**
 * `fill`: soldan dolan çubuk (400–900 ms). İzi (track) çağıran çizer:
 *   <View className="h-1.5 rounded-full bg-border overflow-hidden"><Fill value={0.6} /></View>
 */
export function Fill({ value, className = 'bg-primary', duration = 600, delay = 0 }: FillProps) {
  const v = useAnimatedProgress(value, { duration, delay })
  const style = useAnimatedStyle(() => ({ width: `${v.value * 100}%`, height: '100%' }))
  return (
    <Animated.View style={style}>
      <View className={cn('flex-1', className)} />
    </Animated.View>
  )
}
