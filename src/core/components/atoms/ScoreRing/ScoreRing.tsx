import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { View } from 'react-native'

import { useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'

import { AnimatedCircle, EASE_OUT, useReduceMotion } from '@/core/motion'
import { useThemeColors } from '@/core/theme'

export type ScoreRingProps = {
  value: number
  max: number
  /** Çap (px), varsayılan 120. */
  size?: number
  strokeWidth?: number
  /** Ortadaki içerik (puan + "/ 21 puan"). */
  children?: ReactNode
  accessibilityLabel?: string
}

/**
 * ScoreRing — SVG çember 0'dan skora çizilir (`score-ring`, 1,4 sn, 300 ms
 * gecikme). İz border-strong, dolgu primary. Test sonucu.
 */
export function ScoreRing({
  value,
  max,
  size = 120,
  strokeWidth = 12,
  children,
  accessibilityLabel,
}: ScoreRingProps) {
  const colors = useThemeColors()
  const reduce = useReduceMotion()
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0
  const target = circumference * (1 - ratio)
  const offset = useSharedValue(reduce ? target : circumference)

  useEffect(() => {
    offset.value = reduce
      ? target
      : withDelay(300, withTiming(target, { duration: 1400, easing: EASE_OUT }))
  }, [reduce, target, offset])

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: offset.value }))

  return (
    // REASON: çap prop'tan gelir
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? `${value} / ${max}`}
      accessibilityValue={{ min: 0, max, now: value }}
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors.borderStrong}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
        />
      </Svg>
      {children}
    </View>
  )
}
