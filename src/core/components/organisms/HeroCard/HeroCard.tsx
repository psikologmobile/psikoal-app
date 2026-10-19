import type { ReactNode } from 'react'

import { View } from 'react-native'

import type { IconName } from '@/core/components/atoms/Icon'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { Orbit, PressableScale, Wobble } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type HeroCardProps = {
  /** Üst küçük etiket ("BUGÜN"). */
  eyebrow?: string
  title: string
  actionLabel?: string
  actionIcon?: IconName
  onAction?: () => void
  /** Düğmenin sağındaki not ("3 ilan hakkın var"). */
  note?: string
  /** quarter: köşede salınan çeyrek daire (Keşfet) · orbit: dönen kesikli halka (Bakiyem) */
  decor?: 'quarter' | 'orbit'
  /** Başlık yerine özel gövde (ör. bakiye rakamı). */
  children?: ReactNode
  className?: string
}

/**
 * HeroCard — accent zemin (radius 28, p 24), dönen köşe dekoru, başlık
 * (display 32), birincil düğme. Keşfet, Bakiyem. Gölge/gradyan yok.
 */
export function HeroCard({
  eyebrow,
  title,
  actionLabel,
  actionIcon = 'Plus',
  onAction,
  note,
  decor = 'quarter',
  children,
  className,
}: HeroCardProps) {
  const colors = useThemeColors()
  return (
    <View className={cn('relative gap-4 overflow-hidden rounded-4xl bg-accent p-6', className)}>
      <View pointerEvents="none" accessibilityElementsHidden className="absolute -right-10 -top-10">
        {decor === 'quarter' ? (
          <Wobble style={{ transformOrigin: '100% 0%' }}>
            <View className="h-[150px] w-[150px] rounded-bl-[150px] bg-accent-line" />
          </Wobble>
        ) : (
          <Orbit duration={16000}>
            <View className="h-[200px] w-[200px] rounded-full border border-dashed border-accent-line" />
          </Orbit>
        )}
      </View>
      {eyebrow ? (
        <Text variant="overline" className="text-label text-accent-muted">
          {eyebrow}
        </Text>
      ) : null}
      {children ?? (
        <Text
          accessibilityRole="header"
          className="max-w-[270px] font-display text-[32px] leading-[34px] text-accent-fg"
        >
          {title}
        </Text>
      )}
      {actionLabel && onAction ? (
        <View className="flex-row items-center justify-between gap-3">
          <PressableScale
            onPress={onAction}
            haptics="medium"
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            className="h-13 flex-row items-center gap-2 rounded-lg bg-primary px-5"
          >
            <Icon name={actionIcon} size={18} color={colors.onPrimary} strokeWidth={2.5} />
            <Text className="font-body-bold text-base text-primary-fg">{actionLabel}</Text>
          </PressableScale>
          {note ? (
            <Text className="flex-1 text-right text-body-sm text-accent-muted">{note}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}
