import type { ReactNode } from 'react'

import { View } from 'react-native'

import type { IconName } from '@/core/components/atoms/Icon'

import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { EnterUp, Float } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type EmptyStateProps = {
  title: string
  description?: string
  /** Varsayılan illüstrasyon: accent-soft kutuda ikon. */
  icon?: IconName
  /** Özel illüstrasyon (radar, 3'lü ızgara …). Yüzme (`float`) ile sarılır. */
  illustration?: ReactNode
  ctaLabel?: string
  onCta?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  /** compact: satır içi (kesikli çerçeveli yatay kart) */
  variant?: 'page' | 'compact'
  className?: string
}

/**
 * EmptyState — yüzen illüstrasyon + başlık + açıklama + birincil eylem.
 * Her liste. Girişler sıralı (enter-up).
 */
export function EmptyState({
  title,
  description,
  icon = 'Inbox',
  illustration,
  ctaLabel,
  onCta,
  secondaryLabel,
  onSecondary,
  variant = 'page',
  className,
}: EmptyStateProps) {
  const colors = useThemeColors()
  const art = illustration ?? (
    <View
      className={cn(
        'items-center justify-center bg-accent-soft',
        variant === 'compact' ? 'h-14 w-14 rounded-xl' : 'h-24 w-24 rounded-[30px]'
      )}
    >
      <Icon
        name={icon}
        size={variant === 'compact' ? 26 : 40}
        color={colors.onAccentSoft}
        strokeWidth={2}
      />
    </View>
  )

  if (variant === 'compact') {
    return (
      <View
        className={cn(
          'flex-row items-center gap-3.5 rounded-2xl border border-dashed border-border-strong p-5',
          className
        )}
      >
        <Float>{art}</Float>
        <View className="flex-1 gap-1">
          <Text className="font-body-bold text-base text-fg">{title}</Text>
          {description ? <Text className="text-body-sm text-fg-muted">{description}</Text> : null}
        </View>
      </View>
    )
  }

  return (
    <View className={cn('flex-1 items-center justify-center gap-4 px-8 py-12', className)}>
      <Float>{art}</Float>
      <EnterUp index={1} className="items-center gap-2">
        <Text variant="h3" align="center" className="text-[26px] leading-[30px]">
          {title}
        </Text>
        {description ? (
          <Text variant="body" color="muted" align="center" className="max-w-[320px]">
            {description}
          </Text>
        ) : null}
      </EnterUp>
      {ctaLabel && onCta ? (
        <EnterUp index={2} className="items-center gap-1">
          <Button label={ctaLabel} onPress={onCta} size="lg" />
          {secondaryLabel && onSecondary ? (
            <Button label={secondaryLabel} onPress={onSecondary} variant="link" size="sm" />
          ) : null}
        </EnterUp>
      ) : null}
    </View>
  )
}
