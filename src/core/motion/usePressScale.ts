import { useCallback } from 'react'

import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { DURATION, EASE_OUT, PRESS_SCALE } from './config'
import { useReduceMotion } from './useReduceMotion'

/**
 * `press`: basınca scale 1 → .96 (150 ms). Azaltılmış harekette ölçek değişmez.
 *
 *   const press = usePressScale()
 *   <Animated.View style={press.style}><Pressable onPressIn={press.onPressIn} onPressOut={press.onPressOut} /></Animated.View>
 */
export function usePressScale(scaleTo: number = PRESS_SCALE) {
  const reduce = useReduceMotion()
  const scale = useSharedValue(1)

  const onPressIn = useCallback(() => {
    if (reduce) return
    scale.value = withTiming(scaleTo, { duration: DURATION.press, easing: EASE_OUT })
  }, [reduce, scale, scaleTo])

  const onPressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: DURATION.press, easing: EASE_OUT })
  }, [scale])

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return { style, onPressIn, onPressOut }
}
