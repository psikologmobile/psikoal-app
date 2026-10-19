import { Image, View } from 'react-native'

import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import { useLoopProgress } from '@/core/motion'
import { Orbit } from '@/core/motion'
import { cn } from '@/core/utils/cn'

type CoverSize = 'thumb' | 'card' | 'hero'

export type BlogCoverProps = {
  /** Kapak görseli; yoksa geometrik dalga kapağı çizilir. */
  imageUrl?: string | null
  size?: CoverSize
  /** Çubuk boylarını yazıya göre çeşitlendirmek için tohum (ör. slug). */
  seed?: string
  className?: string
}

const SIZES: Record<CoverSize, { box: string; bar: number; heights: number[]; gap: string }> = {
  thumb: { box: 'h-[76px] w-[76px] rounded-lg', bar: 14, heights: [30, 44, 22], gap: 'gap-1' },
  card: { box: 'h-[170px] w-full', bar: 46, heights: [90, 130, 70], gap: 'gap-2.5' },
  hero: { box: 'h-[300px] w-full', bar: 60, heights: [120, 170, 90], gap: 'gap-3.5' },
}

const BAR_TONES = ['bg-accent', 'bg-primary', 'bg-accent-line'] as const

function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997
  return h
}

/** `wave`: çubuk ±10–12 px dalgalanır, 3,2 sn ∞, sıralı gecikme. */
function WaveBar({
  width,
  height,
  delay,
  tone,
}: {
  width: number
  height: number
  delay: number
  tone: string
}) {
  const { t } = useLoopProgress({ duration: 1600, delay, reverse: true })
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -10 * t.value }] }))
  // REASON: çubuk ölçüleri kapak boyutundan hesaplanır.
  return (
    <Animated.View style={[{ width, height }, style]}>
      <View
        className={cn('flex-1', tone)}
        style={{ borderTopLeftRadius: width / 2, borderTopRightRadius: width / 2 }}
      />
    </Animated.View>
  )
}

/**
 * BlogCover — düz geometrik kapak: accent-soft zemin, dönen kesikli halka,
 * dalgalanan üç çubuk. Görsel varsa görsel gösterilir.
 */
export function BlogCover({ imageUrl, size = 'card', seed = '', className }: BlogCoverProps) {
  const spec = SIZES[size]
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        accessibilityIgnoresInvertColors
        className={cn(spec.box, className)}
        resizeMode="cover"
      />
    )
  }
  const shift = size === 'thumb' ? hash(seed) % 3 : 0
  const heights = spec.heights.map((_, i) => spec.heights[(i + shift) % 3] ?? 0)
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn(
        'overflow-hidden',
        size === 'thumb' ? 'bg-surface' : 'bg-accent-soft',
        spec.box,
        className
      )}
    >
      {size !== 'thumb' ? (
        <View
          pointerEvents="none"
          className={size === 'hero' ? 'absolute -right-20 -top-20' : 'absolute -left-12 -top-12'}
        >
          <Orbit duration={size === 'hero' ? 18000 : 16000}>
            <View
              className={cn(
                'rounded-full border border-dashed border-accent-line',
                size === 'hero' ? 'h-[280px] w-[280px]' : 'h-[200px] w-[200px]'
              )}
            />
          </Orbit>
        </View>
      ) : null}
      <View
        className={cn(
          'absolute bottom-0 flex-row items-end',
          spec.gap,
          size === 'thumb'
            ? 'inset-x-0 justify-center pb-3'
            : size === 'hero'
              ? 'left-9'
              : 'right-[30px]'
        )}
      >
        {heights.map((height, i) => (
          <WaveBar
            key={i}
            width={spec.bar}
            height={height}
            delay={i * (size === 'card' ? 500 : 400)}
            tone={BAR_TONES[i] ?? 'bg-primary'}
          />
        ))}
      </View>
    </View>
  )
}
