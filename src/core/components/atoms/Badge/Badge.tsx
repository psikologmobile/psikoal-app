import type { ReactNode } from 'react'

import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

/**
 * @deprecated v1 rozeti. Yeni kodda durum için `StatusPill`, sayaç için
 * `CountBadge`, meta için `TagChip` kullan. Değerler v2 renklerine eşlendi.
 */
export type BadgeVariant = 'sky' | 'sage' | 'warning' | 'error' | 'neutral' | 'success' | 'info'
export type BadgeSize = 'sm' | 'md'

export type BadgeProps = {
  label: string
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  icon?: ReactNode
  className?: string
}

const containerVariantStyles: Record<BadgeVariant, string> = {
  sky: 'bg-accent-soft',
  sage: 'bg-accent',
  warning: 'bg-accent-soft',
  error: 'border border-danger bg-danger-soft',
  neutral: 'border border-border-strong',
  success: 'bg-accent',
  info: 'bg-accent-soft',
}

const textVariantStyles: Record<BadgeVariant, string> = {
  sky: 'text-accent-soft-fg',
  sage: 'text-accent-fg',
  warning: 'text-accent-soft-fg',
  error: 'text-danger-soft-fg',
  neutral: 'text-fg-muted',
  success: 'text-accent-fg',
  info: 'text-accent-soft-fg',
}

const containerSizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 gap-1',
  md: 'px-2.5 py-1 gap-1.5',
}

export function Badge({
  label,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className,
}: BadgeProps) {
  return (
    <View
      className={cn(
        'flex-row items-center self-start rounded-full',
        containerVariantStyles[variant],
        containerSizeStyles[size],
        className
      )}
      accessibilityRole="text"
    >
      {dot && (
        <View
          className={cn('rounded-full bg-primary', size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')}
        />
      )}
      {icon}
      <Text className={cn('font-body-bold text-badge', textVariantStyles[variant])}>{label}</Text>
    </View>
  )
}
