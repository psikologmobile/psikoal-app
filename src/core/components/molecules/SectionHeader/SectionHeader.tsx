import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { PressableScale } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type SectionHeaderProps = {
  title: string
  actionLabel?: string
  onAction?: () => void
  /** title: bölüm başlığı (display 20) · overline: grup etiketi (12/800, büyük harf) */
  variant?: 'title' | 'overline'
  className?: string
}

/** Bölüm başlığı + sağda bağlantı ("Tümü", "Sonuçlarım"). */
export function SectionHeader({
  title,
  actionLabel,
  onAction,
  variant = 'title',
  className,
}: SectionHeaderProps) {
  return (
    <View className={cn('flex-row items-baseline justify-between', className)}>
      {variant === 'title' ? (
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
      ) : (
        <Text variant="overline" color="muted" accessibilityRole="header" className="px-1.5">
          {title}
        </Text>
      )}
      {actionLabel && onAction ? (
        <PressableScale
          onPress={onAction}
          hitSlop={10}
          accessibilityRole="link"
          accessibilityLabel={actionLabel}
        >
          <Text className="font-body-semibold text-body-sm text-link">{actionLabel}</Text>
        </PressableScale>
      ) : null}
    </View>
  )
}
