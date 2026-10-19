import type { ReactNode } from 'react'

import { View } from 'react-native'

import type { IconName } from '@/core/components/atoms/Icon'

import { Icon } from '@/core/components/atoms/Icon'
import { PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type IconButtonVariant = 'outline' | 'ghost' | 'primary' | 'surface'
export type IconButtonSize = 'sm' | 'md' | 'lg'

export type IconButtonProps = {
  /** Ekran okuyucu etiketi — zorunlu (ikon tek başına anlam taşımaz). */
  accessibilityLabel: string
  onPress: () => void
  icon?: IconName
  /** Özel ikon (ör. Bell döngüsüyle sarılmış zil). `icon` yerine. */
  children?: ReactNode
  variant?: IconButtonVariant
  size?: IconButtonSize
  /** Sağ üst köşe rozeti (CountBadge). */
  badge?: ReactNode
  iconColor?: string
  isDisabled?: boolean
  className?: string
  testID?: string
}

const variantStyles: Record<IconButtonVariant, string> = {
  outline: 'border border-border-strong bg-transparent',
  ghost: 'bg-transparent',
  primary: 'bg-primary',
  surface: 'bg-surface',
}

// sm 36 (satır içi kopyala), md 44 (geri, kapat), lg 48 (zil)
const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'h-9 w-9 rounded-inner',
  md: 'h-11 w-11 rounded-full',
  lg: 'h-12 w-12 rounded-full',
}
const ICON_SIZE: Record<IconButtonSize, number> = { sm: 18, md: 20, lg: 22 }

/** IconButton — 44×44 outline daire veya zeminsiz. Geri, zil, kopyala, kapat. */
export function IconButton({
  accessibilityLabel,
  onPress,
  icon,
  children,
  variant = 'outline',
  size = 'md',
  badge,
  iconColor,
  isDisabled = false,
  className,
  testID,
}: IconButtonProps) {
  const colors = useThemeColors()
  const color = iconColor ?? (variant === 'primary' ? colors.onPrimary : colors.text)
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      hitSlop={size === 'sm' ? 4 : 0}
      wrapperClassName="self-start"
      className={cn(
        'relative items-center justify-center',
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && 'opacity-50',
        className
      )}
    >
      {children ??
        (icon ? <Icon name={icon} size={ICON_SIZE[size]} color={color} strokeWidth={2.2} /> : null)}
      {badge ? <View className="absolute -right-1 -top-1">{badge}</View> : null}
    </PressableScale>
  )
}
