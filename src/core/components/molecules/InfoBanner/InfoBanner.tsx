import type { ReactNode } from 'react'

import { View } from 'react-native'

import type { IconName } from '@/core/components/atoms/Icon'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type InfoBannerProps = {
  children: ReactNode
  icon?: IconName
  /** accent: accent-soft vurgu (varsayılan) · neutral: surface zemin, muted yazı */
  tone?: 'accent' | 'neutral'
  className?: string
}

/** InfoBanner — accent-soft zemin, ikon, metin. İletişim izni bilgisi, profil incelemede. */
export function InfoBanner({
  children,
  icon = 'ShieldCheck',
  tone = 'accent',
  className,
}: InfoBannerProps) {
  const colors = useThemeColors()
  const accent = tone === 'accent'
  return (
    <View
      accessibilityRole="text"
      className={cn(
        'flex-row gap-2.5 rounded-lg p-3.5',
        accent ? 'bg-accent-soft' : 'bg-surface',
        className
      )}
    >
      <Icon
        name={icon}
        size={18}
        strokeWidth={2}
        color={accent ? colors.onAccentSoft : colors.textMuted}
      />
      <View className="flex-1">
        {typeof children === 'string' ? (
          <Text
            className={cn('text-label leading-5', accent ? 'text-accent-soft-fg' : 'text-fg-muted')}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </View>
  )
}
