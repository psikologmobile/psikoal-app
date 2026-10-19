import type { ReactNode } from 'react'

import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { DrawCheck, Pop, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type RadioCardVariant = 'large' | 'list'

export type RadioCardProps = {
  title: string
  description?: string
  selected: boolean
  onPress: () => void
  /**
   * large: rol seçimi kartı (padding 22, radius 24, 56 px işaret kutusu; seçiliyken
   * accent zemin) · list: satır kartı (h 60–72, radius 18; seçiliyken accent-soft
   * zemin + accent-line çizgi).
   */
  variant?: RadioCardVariant
  /** Sol işaret: harf/rakam ("D", "U") ya da özel düğüm. */
  mark?: ReactNode
  isDisabled?: boolean
  className?: string
  testID?: string
}

/**
 * RadioCard — off: surface + border-strong · on: vurgu zemini + pop tik.
 * Kapsayıcıya `accessibilityRole="radiogroup"` verin.
 */
export function RadioCard({
  title,
  description,
  selected,
  onPress,
  variant = 'list',
  mark,
  isDisabled = false,
  className,
  testID,
}: RadioCardProps) {
  const colors = useThemeColors()
  const large = variant === 'large'

  const on = large ? 'border-accent bg-accent' : 'border-accent-line bg-accent-soft'
  const titleColor = selected ? (large ? 'text-accent-fg' : 'text-accent-soft-fg') : 'text-fg'
  const descColor = selected
    ? large
      ? 'text-accent-muted'
      : 'text-accent-soft-fg'
    : 'text-fg-muted'

  const markNode =
    mark === undefined ? null : typeof mark === 'string' ? (
      <View
        className={cn(
          'items-center justify-center',
          large ? 'h-14 w-14 rounded-xl' : 'h-10 w-10 rounded-sm',
          selected ? 'bg-primary' : 'bg-accent-soft'
        )}
      >
        <Text
          className={cn(
            'font-display',
            large ? 'text-2xl' : 'text-lg',
            selected ? 'text-primary-fg' : 'text-accent-soft-fg'
          )}
        >
          {mark}
        </Text>
      </View>
    ) : (
      mark
    )

  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      haptics="selection"
      accessibilityRole="radio"
      accessibilityLabel={description ? `${title}. ${description}` : title}
      accessibilityState={{ checked: selected, disabled: isDisabled }}
      className={cn(
        'flex-row items-center border',
        large ? 'gap-4 rounded-3xl p-[22px]' : 'min-h-15 gap-3 rounded-xl px-4 py-3',
        selected ? on : 'border-border-strong bg-surface',
        isDisabled && 'opacity-50',
        className
      )}
    >
      {markNode}
      <View className="flex-1 gap-1">
        <Text
          className={cn(large ? 'font-body-bold text-xl' : 'font-body-bold text-body', titleColor)}
        >
          {title}
        </Text>
        {description ? (
          <Text className={cn(large ? 'text-body' : 'text-body-sm', descColor)}>{description}</Text>
        ) : null}
      </View>
      {selected ? (
        <Pop>
          <View
            className={cn(
              'items-center justify-center rounded-full bg-primary',
              large ? 'h-[30px] w-[30px]' : 'h-6 w-6'
            )}
          >
            <DrawCheck
              size={large ? 18 : 14}
              color={colors.onPrimary}
              strokeWidth={3}
              delay={120}
            />
          </View>
        </Pop>
      ) : (
        <View
          className={cn(
            'rounded-full border border-border-strong',
            large ? 'h-[30px] w-[30px]' : 'h-6 w-6'
          )}
        />
      )}
    </PressableScale>
  )
}
