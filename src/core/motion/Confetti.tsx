import { useEffect, useState } from 'react'

import { View } from 'react-native'
import type { LayoutChangeEvent } from 'react-native'

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import { useReduceMotion } from './useReduceMotion'

import { cn } from '@/core/utils/cn'

/**
 * Tasarımdaki 14 parça (b0 · Eşleşti): sol konum (440 px genişliğe göre),
 * boyut, köşe, renk ve gecikme. c1 = accent-line, c2 = primary.
 */
const PIECES = [
  { x: 24, w: 10, h: 10, round: true, c: 1, d: 0 },
  { x: 70, w: 12, h: 12, round: false, c: 2, d: 250 },
  { x: 112, w: 8, h: 8, round: true, c: 2, d: 100 },
  { x: 150, w: 14, h: 6, round: false, c: 1, d: 400 },
  { x: 196, w: 10, h: 10, round: false, c: 2, d: 50 },
  { x: 232, w: 12, h: 12, round: true, c: 1, d: 300 },
  { x: 270, w: 8, h: 14, round: false, c: 2, d: 150 },
  { x: 310, w: 10, h: 10, round: true, c: 1, d: 450 },
  { x: 350, w: 12, h: 12, round: false, c: 2, d: 200 },
  { x: 396, w: 9, h: 9, round: true, c: 1, d: 350 },
  { x: 48, w: 6, h: 14, round: false, c: 1, d: 600 },
  { x: 214, w: 8, h: 8, round: true, c: 2, d: 650 },
  { x: 330, w: 14, h: 6, round: false, c: 1, d: 700 },
  { x: 410, w: 10, h: 10, round: false, c: 2, d: 550 },
] as const

const DESIGN_WIDTH = 440
const FALL_EASE = Easing.bezier(0.3, 0.6, 0.6, 1)

type PieceProps = {
  piece: (typeof PIECES)[number]
  width: number
  height: number
  baseDelay: number
  duration: number
  runKey: unknown
}

function Piece({ piece, width, height, baseDelay, duration, runKey }: PieceProps) {
  const t = useSharedValue(0)
  useEffect(() => {
    t.value = 0
    t.value = withDelay(baseDelay + piece.d, withTiming(1, { duration, easing: FALL_EASE }))
  }, [baseDelay, piece.d, duration, t, runKey])

  const style = useAnimatedStyle(() => ({
    // 0 → %10 belirir, sonra düşerek döner (-120 px → alt kenar)
    opacity: t.value === 0 ? 0 : Math.min(1, t.value * 10),
    transform: [{ translateY: -120 + (height + 140) * t.value }, { rotate: `${540 * t.value}deg` }],
  }))

  // REASON: konum/boyut parçaya göre hesaplanır; className ile ifade edilemez.
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: (piece.x / DESIGN_WIDTH) * width,
          width: piece.w,
          height: piece.h,
        },
        style,
      ]}
    >
      <View
        className={cn(
          'flex-1',
          piece.round ? 'rounded-full' : 'rounded-[3px]',
          piece.c === 1 ? 'bg-accent-line' : 'bg-primary'
        )}
      />
    </Animated.View>
  )
}

export type ConfettiProps = {
  /** Değiştikçe yeniden oynar. */
  runKey?: unknown
  /** İlk parçanın gecikmesi (ms). Eşleşti: 1000, ilan yayınlandı: 300. */
  delay?: number
  /** Düşüş süresi (ms), 2600–3200. */
  duration?: number
  /** Parça sayısı (en çok 14; ilan yayınlandı 6). */
  count?: number
  className?: string
}

/**
 * `confetti`: 14 parça, primary + accent-line, düşerek döner. Üst katmana
 * mutlak konumla serilir (`absolute inset-0`), dokunmayı engellemez. Azaltılmış
 * harekette hiç çizilmez.
 */
export function Confetti({
  runKey,
  delay = 1000,
  duration = 3200,
  count = 14,
  className,
}: ConfettiProps) {
  const reduce = useReduceMotion()
  const [box, setBox] = useState({ width: DESIGN_WIDTH, height: 760 })

  if (reduce) return null

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    if (width > 0 && height > 0) setBox({ width, height })
  }

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={onLayout}
      className={cn('absolute inset-0 overflow-hidden', className)}
    >
      {PIECES.slice(0, Math.max(0, Math.min(14, count))).map((piece, i) => (
        <Piece
          key={i}
          piece={piece}
          width={box.width}
          height={box.height}
          baseDelay={delay}
          duration={duration}
          runKey={runKey}
        />
      ))}
    </View>
  )
}
