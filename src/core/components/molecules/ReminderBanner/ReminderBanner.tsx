import type { ReactNode } from 'react'

import { View } from 'react-native'

import type { IconName } from '@/core/components/atoms/Icon'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { PressableScale, PulseDot } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type ReminderBannerProps = {
  children: ReactNode
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  icon?: IconName
  className?: string
}

/**
 * ReminderBanner — accent-soft zemin, nabızlı primary ikon, iki eylem.
 * "Bir uzman anlaştığını bildirdi".
 */
export function ReminderBanner({
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  icon = 'Check',
  className,
}: ReminderBannerProps) {
  const colors = useThemeColors()
  return (
    <View className={cn('gap-3 rounded-3xl bg-accent-soft p-4.5', className)}>
      <View className="flex-row items-start gap-3">
        <PulseDot size={40} colorClassName="bg-primary">
          <Icon name={icon} size={20} color={colors.onPrimary} strokeWidth={2.4} />
        </PulseDot>
        <View className="flex-1">
          {typeof children === 'string' ? (
            <Text className="text-body leading-[22px] text-accent-soft-fg">{children}</Text>
          ) : (
            children
          )}
        </View>
      </View>
      <View className="flex-row gap-2">
        <PressableScale
          onPress={onPrimary}
          haptics="medium"
          accessibilityRole="button"
          accessibilityLabel={primaryLabel}
          wrapperClassName="flex-1"
          className="h-11 items-center justify-center rounded-sm bg-primary"
        >
          <Text className="font-body-bold text-body text-primary-fg">{primaryLabel}</Text>
        </PressableScale>
        {secondaryLabel && onSecondary ? (
          <PressableScale
            onPress={onSecondary}
            accessibilityRole="button"
            accessibilityLabel={secondaryLabel}
            wrapperClassName="flex-1"
            className="h-11 items-center justify-center rounded-sm border border-accent-line"
          >
            <Text className="font-body-semibold text-body text-accent-soft-fg">
              {secondaryLabel}
            </Text>
          </PressableScale>
        ) : null}
      </View>
    </View>
  )
}
