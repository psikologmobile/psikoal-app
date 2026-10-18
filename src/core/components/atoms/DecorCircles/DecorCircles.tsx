// @deprecated v1 hero dekoru (beyaz daireler, marka zemini). v2 hero için HeroCard (dönen köşe dekoru) kullan.
import { useEffect } from 'react'

import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { cn } from '@/core/utils/cn'

export type DecorCirclesProps = {
  phase?: number
}

const MOVE_TIMING = { duration: 700, easing: Easing.out(Easing.cubic) }

const OFFSETS = [
  { big: { x: 0, y: 0 }, mid: { x: 0, y: 0 }, tiny: { x: 0, y: 0 } },
  { big: { x: -120, y: 90 }, mid: { x: 150, y: -60 }, tiny: { x: -180, y: -120 } },
  { big: { x: 60, y: 210 }, mid: { x: 270, y: 30 }, tiny: { x: -60, y: -270 } },
  { big: { x: -210, y: 60 }, mid: { x: 90, y: -150 }, tiny: { x: -240, y: 60 } },
] as const

const circleColors = {
  big: 'bg-white/10',
  mid: 'bg-white/[0.07]',
  tiny: 'bg-white/[0.05]',
}

export function DecorCircles({ phase = 0 }: DecorCirclesProps) {
  const reducedMotion = useReducedMotion()

  const bigX = useSharedValue(0)
  const bigY = useSharedValue(0)
  const midX = useSharedValue(0)
  const midY = useSharedValue(0)
  const tinyX = useSharedValue(0)
  const tinyY = useSharedValue(0)

  useEffect(() => {
    const offset = OFFSETS[Math.abs(phase) % OFFSETS.length] ?? OFFSETS[0]
    const targets: Array<[typeof bigX, number]> = [
      [bigX, offset.big.x],
      [bigY, offset.big.y],
      [midX, offset.mid.x],
      [midY, offset.mid.y],
      [tinyX, offset.tiny.x],
      [tinyY, offset.tiny.y],
    ]
    targets.forEach(([sv, value]) => {
      sv.value = reducedMotion ? value : withTiming(value, MOVE_TIMING)
    })
  }, [phase, reducedMotion, bigX, bigY, midX, midY, tinyX, tinyY])

  const bigStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bigX.value }, { translateY: bigY.value }],
  }))
  const midStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: midX.value }, { translateY: midY.value }],
  }))
  const tinyStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tinyX.value }, { translateY: tinyY.value }],
  }))

  return (
    <>
      <Animated.View
        pointerEvents="none"
        className={cn('absolute rounded-full', circleColors.big)}
        style={[{ width: 220, height: 220, top: -70, right: -60 }, bigStyle]}
      />
      <Animated.View
        pointerEvents="none"
        className={cn('absolute rounded-full', circleColors.mid)}
        style={[{ width: 140, height: 140, bottom: -50, left: -40 }, midStyle]}
      />
      <Animated.View
        pointerEvents="none"
        className={cn('absolute rounded-full', circleColors.tiny)}
        style={[{ width: 90, height: 90, bottom: 40, right: -30 }, tinyStyle]}
      />
    </>
  )
}
