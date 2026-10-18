import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

export type DividerOrientation = 'horizontal' | 'vertical'
export type DividerColor = 'default' | 'muted' | 'strong' | 'brand'
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg'

export type DividerProps = {
  orientation?: DividerOrientation
  color?: DividerColor
  spacing?: DividerSpacing
  label?: string
  className?: string
}

const colorStyles: Record<DividerColor, string> = {
  default: 'bg-border',
  muted: 'bg-border',
  strong: 'bg-border-strong',
  brand: 'bg-accent-line',
}

const spacingStyles: Record<DividerSpacing, string> = {
  none: '',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
}

const spacingVerticalStyles: Record<DividerSpacing, string> = {
  none: '',
  sm: 'mx-2',
  md: 'mx-4',
  lg: 'mx-6',
}

export function Divider({
  orientation = 'horizontal',
  color = 'default',
  spacing = 'md',
  label,
  className,
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <View
        className={cn(
          'w-[1.5px] self-stretch',
          colorStyles[color],
          spacingVerticalStyles[spacing],
          className
        )}
        accessibilityRole="none"
      />
    )
  }

  if (label) {
    return (
      <View className={cn('flex-row items-center gap-3', spacingStyles[spacing], className)}>
        <View className={cn('h-[1.5px] flex-1', colorStyles[color])} />
        <Text variant="caption" color="muted">
          {label}
        </Text>
        <View className={cn('h-[1.5px] flex-1', colorStyles[color])} />
      </View>
    )
  }

  return (
    <View
      className={cn('h-[1.5px] w-full', colorStyles[color], spacingStyles[spacing], className)}
      accessibilityRole="none"
    />
  )
}
