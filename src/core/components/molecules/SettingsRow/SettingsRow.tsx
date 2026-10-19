import type { ReactNode } from 'react'

import { View } from 'react-native'

import type { IconName } from '@/core/components/atoms/Icon'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { PressableScale } from '@/core/motion'
import { hoverNudge, hoverSurface, useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type SettingsRowProps = {
  label: string
  icon?: IconName
  /** Sağda soluk ipucu ("Türkçe", "Açık"). */
  hint?: string
  onPress?: () => void
  /** Chevron yerine özel sağ öğe (Switch vb.). */
  right?: ReactNode
  /** Grubun son satırı: alt çizgi çizilmez. */
  isLast?: boolean
  danger?: boolean
  testID?: string
}

/**
 * SettingsRow — 34 px ikon kutusu (surface, primary-text ikon) + etiket +
 * ipucu + chevron; h 56. Grup kabı için SettingsGroup. Ayarlar.
 */
export function SettingsRow({
  label,
  icon,
  hint,
  onPress,
  right,
  isLast = false,
  danger = false,
  testID,
}: SettingsRowProps) {
  const colors = useThemeColors()
  const body = (
    <View
      className={cn(
        'h-14 flex-row items-center gap-3 px-3.5',
        !isLast && 'border-b border-border',
        onPress && hoverSurface
      )}
    >
      {icon ? (
        <View className="h-[34px] w-[34px] items-center justify-center rounded-inner bg-surface">
          <Icon
            name={icon}
            size={18}
            strokeWidth={2}
            color={danger ? colors.danger : colors.primaryText}
          />
        </View>
      ) : null}
      <Text
        numberOfLines={1}
        className={cn('flex-1 font-body-semibold text-body', danger ? 'text-danger' : 'text-fg')}
      >
        {label}
      </Text>
      {hint ? <Text className="text-label text-fg-muted">{hint}</Text> : null}
      {right ??
        (onPress ? (
          <View className={hoverNudge}>
            <Icon name="ChevronRight" size={18} color={colors.textMuted} strokeWidth={2.4} />
          </View>
        ) : null)}
    </View>
  )
  if (!onPress) return body
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      scaleTo={0.98}
      className="group"
      accessibilityRole="button"
      accessibilityLabel={hint ? `${label}, ${hint}` : label}
    >
      {body}
    </PressableScale>
  )
}

export type SettingsGroupProps = {
  children: ReactNode
  /** Grup başlığı (overline: "Hesap", "Uygulama"). */
  title?: string
  className?: string
}

/** SettingsGroup — radius 20, 1,5 px border çerçeve; satırlar arası çizgi. */
export function SettingsGroup({ children, title, className }: SettingsGroupProps) {
  return (
    <View className={cn('gap-2', className)}>
      {title ? (
        <Text variant="overline" color="muted" accessibilityRole="header" className="px-1.5">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-card border border-border">{children}</View>
    </View>
  )
}
