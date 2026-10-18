import { useEffect } from 'react'

import { useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import Svg from 'react-native-svg'

import { EASE_OUT } from './config'
import { AnimatedPath } from './svg'
import { useReduceMotion } from './useReduceMotion'

export type DrawCheckProps = {
  size?: number
  color: string
  strokeWidth?: number
  /** Gecikme (ms). */
  delay?: number
  /** Süre (ms), 400–700 arası; varsayılan 450. */
  duration?: number
  /** Varsayılan tik: M5 12l5 5 9-10 (viewBox 0 0 24 24). */
  d?: string
  viewBox?: string
  /** stroke-dasharray uzunluğu (tasarım: 80, büyük tikte 60). */
  length?: number
  replayKey?: string | number | boolean
}

/** `draw-check`: SVG tik stroke-dashoffset 80→0 ile çizilir. */
export function DrawCheck({
  size = 16,
  color,
  strokeWidth = 3.4,
  delay = 0,
  duration = 450,
  d = 'M5 12l5 5 9-10',
  viewBox = '0 0 24 24',
  length = 80,
  replayKey,
}: DrawCheckProps) {
  const reduce = useReduceMotion()
  const offset = useSharedValue(reduce ? 0 : length)

  useEffect(() => {
    if (reduce) {
      offset.value = 0
      return
    }
    offset.value = length
    offset.value = withDelay(delay, withTiming(0, { duration, easing: EASE_OUT }))
  }, [reduce, delay, duration, length, offset, replayKey])

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: offset.value }))

  return (
    <Svg width={size} height={size} viewBox={viewBox} fill="none" accessibilityElementsHidden>
      <AnimatedPath
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        animatedProps={animatedProps}
      />
    </Svg>
  )
}
