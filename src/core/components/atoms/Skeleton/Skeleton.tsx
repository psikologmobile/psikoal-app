import type { ReactNode } from 'react'

import { View } from 'react-native'
import type { DimensionValue } from 'react-native'

import Animated from 'react-native-reanimated'

import { usePulseOpacityStyle } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type SkeletonBorderRadius =
  | 'none'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | 'full'
export type SkeletonVariant = 'line' | 'circle' | 'rect'

export type SkeletonProps = {
  width?: number | string
  height?: number
  borderRadius?: SkeletonBorderRadius
  variant?: SkeletonVariant
  /** Sıralı nabız gecikmesi (ms), parçalar arası 100–150. */
  delay?: number
  className?: string
}

export type SkeletonGroupProps = {
  children: ReactNode
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

const radiusStyles: Record<SkeletonBorderRadius, string> = {
  none: 'rounded-none',
  xs: 'rounded-xs',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
}

const variantDefaults: Record<SkeletonVariant, Partial<SkeletonProps>> = {
  line: { height: 18, borderRadius: 'xs' },
  circle: { height: 48, borderRadius: 'full' },
  rect: { height: 120, borderRadius: '2xl' },
}

const gapStyles = { sm: 'gap-2', md: 'gap-3', lg: 'gap-3.5' } as const

/**
 * Skeleton — border renginde blok, opaklık .4 ↔ 1 nabzı (1,2 sn ∞).
 * Azaltılmış harekette sabit. Liste ve ana sayfa yüklenirken.
 */
export function Skeleton({
  variant = 'rect',
  width,
  height,
  borderRadius,
  delay = 0,
  className,
}: SkeletonProps) {
  const pulse = usePulseOpacityStyle(delay)
  const defaults = variantDefaults[variant]
  const resolvedHeight = height ?? defaults.height ?? 16
  const resolvedRadius = borderRadius ?? defaults.borderRadius ?? 'md'
  const resolvedWidth = variant === 'circle' ? resolvedHeight : width

  return (
    <Animated.View
      accessibilityRole="none"
      accessibilityLabel="Yükleniyor"
      style={[
        pulse,
        // REASON: ölçüler prop'tan gelir (yer tutucu, içerik boyutunu taklit eder)
        { width: (resolvedWidth ?? '100%') as DimensionValue, height: resolvedHeight },
      ]}
    >
      <View className={cn('flex-1 bg-border', radiusStyles[resolvedRadius], className)} />
    </Animated.View>
  )
}

export function SkeletonGroup({ children, gap = 'md', className }: SkeletonGroupProps) {
  return (
    <View accessibilityLabel="Yükleniyor" className={cn('flex-col', gapStyles[gap], className)}>
      {children}
    </View>
  )
}
