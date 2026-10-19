import type { ReactNode } from 'react'

import type { IconName } from '@/core/components/atoms/Icon'
import type { ThemeColors } from '@/core/theme'

import { Icon } from '@/core/components/atoms/Icon'
import { Spinner } from '@/core/components/atoms/Spinner'
import { Text } from '@/core/components/atoms/Text'
import { PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'link'
  | 'danger'
  | 'danger-outline'
  /** @deprecated → outline */
  | 'ghost'
  /** @deprecated → secondary */
  | 'accent'
  /** @deprecated → primary */
  | 'success'
  /** @deprecated → secondary */
  | 'inverse'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | /** @deprecated → sm */ 'xs'

export type ButtonProps = {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  /** Yüklenirken gösterilecek metin ("Gönderiliyor…"). Varsayılan: label. */
  loadingLabel?: string
  isDisabled?: boolean
  /** Lucide ikon adı — rengi varyanta göre otomatik verilir. */
  icon?: IconName
  iconPosition?: 'left' | 'right'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  width?: number
  className?: string
  accessibilityHint?: string
  /**
   * E2E tutamağı. Android'de `resource-id`, iOS'ta `accessibilityIdentifier` olarak
   * dışa vurulur; Maestro akışları bu değere `id:` seçicisiyle bağlanır.
   * Adlandırma sözleşmesi: docs/E2E-TESTID.md
   */
  testID?: string
}

type CoreVariant = 'primary' | 'secondary' | 'outline' | 'link' | 'danger' | 'danger-outline'

const LEGACY: Record<ButtonVariant, CoreVariant> = {
  primary: 'primary',
  secondary: 'secondary',
  outline: 'outline',
  link: 'link',
  danger: 'danger',
  'danger-outline': 'danger-outline',
  ghost: 'outline',
  accent: 'secondary',
  success: 'primary',
  inverse: 'secondary',
}

export const buttonVariantStyles: Record<CoreVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-accent',
  outline: 'border border-border-strong bg-transparent',
  link: 'bg-transparent',
  danger: 'bg-danger-fill',
  'danger-outline': 'border border-danger bg-danger-soft',
}

const labelStyles: Record<CoreVariant, string> = {
  primary: 'text-primary-fg font-body-heavy',
  secondary: 'text-accent-fg font-body-bold',
  outline: 'text-fg font-body-bold',
  link: 'text-link font-body-bold',
  danger: 'text-danger-fg font-body-heavy',
  'danger-outline': 'text-danger-soft-fg font-body-bold',
}

const spinnerStyles: Record<CoreVariant, string> = {
  primary: 'border-primary-fg',
  secondary: 'border-accent-fg',
  outline: 'border-fg',
  link: 'border-link',
  danger: 'border-danger-fg',
  'danger-outline': 'border-danger-soft-fg',
}

function iconColor(v: CoreVariant, c: ThemeColors, disabled: boolean) {
  if (disabled) return c.textMuted
  switch (v) {
    case 'primary':
      return c.onPrimary
    case 'secondary':
      return c.onAccent
    case 'outline':
      return c.text
    case 'link':
      return c.link
    case 'danger':
      return c.onDanger
    case 'danger-outline':
      return c.onDangerSoft
  }
}

export const buttonSizeStyles: Record<Exclude<ButtonSize, 'xs'>, string> = {
  sm: 'h-btn-sm px-4 rounded-sm',
  md: 'h-btn-md px-5 rounded-md',
  lg: 'h-btn-lg px-6 rounded-lg',
  xl: 'h-btn-xl px-6 rounded-xl',
}

const labelSize: Record<Exclude<ButtonSize, 'xs'>, string> = {
  sm: 'text-body-sm',
  md: 'text-body',
  lg: 'text-base',
  xl: 'text-button',
}

const ICON_SIZE = { sm: 16, md: 18, lg: 18, xl: 20 } as const

/**
 * Düğme — components.md §1. Basınca .96, haptic, en az 44 px.
 * Disabled: 1,5 px KESİKLİ border-strong + text-muted (opaklık değil).
 * Loading: spinner + `loadingLabel`.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingLabel,
  isDisabled = false,
  icon,
  iconPosition = 'left',
  leftIcon,
  rightIcon,
  fullWidth = false,
  width,
  className,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const colors = useThemeColors()
  const v = LEGACY[variant]
  const s = size === 'xs' ? 'sm' : size
  const disabled = isDisabled || isLoading
  const showDisabledLook = isDisabled && !isLoading

  const iconNode = icon ? (
    <Icon
      name={icon}
      size={ICON_SIZE[s]}
      color={iconColor(v, colors, showDisabledLook)}
      strokeWidth={2.4}
    />
  ) : null

  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      haptics={v === 'link' || v === 'outline' ? 'light' : 'medium'}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy: isLoading }}
      wrapperClassName={fullWidth ? 'w-full' : width ? undefined : 'self-start'}
      // REASON: sabit genişlik prop'tan gelir (ör. iki düğmeli satırda eşit genişlik)
      style={width ? { width } : undefined}
      className={cn(
        'flex-row items-center justify-center gap-2',
        buttonSizeStyles[s],
        showDisabledLook
          ? 'border border-dashed border-border-strong bg-transparent'
          : buttonVariantStyles[v],
        v === 'link' && 'px-2',
        isLoading && 'opacity-90',
        fullWidth && 'w-full',
        className
      )}
    >
      {isLoading ? (
        <>
          <Spinner size={18} colorClassName={spinnerStyles[v]} />
          <Text className={cn(labelStyles[v], labelSize[s])}>{loadingLabel ?? label}</Text>
        </>
      ) : (
        <>
          {iconPosition === 'left' && iconNode}
          {leftIcon}
          <Text
            className={cn(
              labelStyles[v],
              labelSize[s],
              showDisabledLook && 'text-fg-muted font-body-bold'
            )}
          >
            {label}
          </Text>
          {rightIcon}
          {iconPosition === 'right' && iconNode}
        </>
      )}
    </PressableScale>
  )
}
