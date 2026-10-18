import { Text as RNText } from 'react-native'
import type { TextProps as RNTextProps } from 'react-native'

import { cn } from '@/core/utils/cn'

/**
 * v2 tip ölçeği (src/core/theme/tokens.ts `typography`).
 * Başlıklar Bricolage Grotesque, gövde Figtree. RN özel fontta ağırlık
 * sentezlemediği için `weight` font AİLESİ değiştirir, fontWeight yazmaz.
 */
export type TextVariant =
  | 'hero'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'sheet'
  | 'title'
  | 'number'
  | 'bodyLg'
  | 'body'
  | 'bodySm'
  | 'label'
  | 'button'
  | 'badge'
  | 'overline'
  | 'caption'
  /** @deprecated → h1 */
  | 'display'
  /** @deprecated → h2 */
  | 'heading'
  /** @deprecated → title */
  | 'subheading'

export type TextWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold'

export type TextColor =
  | 'default'
  | 'muted'
  | 'brand'
  | 'link'
  | 'onPrimary'
  | 'onAccent'
  | 'onAccentMuted'
  | 'onAccentSoft'
  | 'danger'
  | 'onDangerSoft'
  | 'onDanger'
  | 'inverse'
  | 'inherit'
  /** @deprecated v1 adları: primary = ana yazı (default) */
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'disabled'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'

export type TextAlign = 'left' | 'center' | 'right'

export type TextProps = RNTextProps & {
  variant?: TextVariant
  weight?: TextWeight
  color?: TextColor
  align?: TextAlign
  className?: string
}

const DISPLAY_VARIANTS = new Set<TextVariant>([
  'hero',
  'h1',
  'h2',
  'h3',
  'sheet',
  'title',
  'number',
  'display',
  'heading',
  'subheading',
])

export const textVariantStyles: Record<TextVariant, string> = {
  hero: 'font-display text-hero',
  h1: 'font-display text-h1',
  h2: 'font-display text-h2',
  h3: 'font-display text-h3',
  sheet: 'font-display text-sheet',
  title: 'font-display-bold text-title',
  number: 'font-display text-number',
  bodyLg: 'font-body text-body-lg',
  body: 'font-body text-body',
  bodySm: 'font-body text-body-sm',
  label: 'font-body-bold text-label',
  button: 'font-body-heavy text-button',
  badge: 'font-body-heavy text-badge',
  overline: 'font-body-heavy text-overline uppercase',
  caption: 'font-body text-xs',
  display: 'font-display text-h1',
  heading: 'font-display text-h2',
  subheading: 'font-display-bold text-title',
}

export const textColorStyles: Record<TextColor, string> = {
  default: 'text-fg',
  muted: 'text-fg-muted',
  brand: 'text-primary-text',
  link: 'text-link',
  onPrimary: 'text-primary-fg',
  onAccent: 'text-accent-fg',
  onAccentMuted: 'text-accent-muted',
  onAccentSoft: 'text-accent-soft-fg',
  danger: 'text-danger',
  onDangerSoft: 'text-danger-soft-fg',
  onDanger: 'text-danger-fg',
  inverse: 'text-bg',
  inherit: '',
  primary: 'text-fg',
  secondary: 'text-fg-muted',
  tertiary: 'text-fg-muted',
  disabled: 'text-fg-muted',
  accent: 'text-accent-soft-fg',
  success: 'text-primary-text',
  warning: 'text-primary-text',
  error: 'text-danger',
}

const bodyWeightStyles: Record<TextWeight, string> = {
  light: 'font-body-regular',
  regular: 'font-body-regular',
  medium: 'font-body',
  semibold: 'font-body-semibold',
  bold: 'font-body-bold',
  extrabold: 'font-body-heavy',
}

const displayWeightStyles: Record<TextWeight, string> = {
  light: 'font-display-bold',
  regular: 'font-display-bold',
  medium: 'font-display-bold',
  semibold: 'font-display-bold',
  bold: 'font-display-bold',
  extrabold: 'font-display',
}

const alignStyles: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export function Text({
  variant = 'body',
  weight,
  color = 'default',
  align,
  className,
  ...props
}: TextProps) {
  const weightClass = weight
    ? DISPLAY_VARIANTS.has(variant)
      ? displayWeightStyles[weight]
      : bodyWeightStyles[weight]
    : undefined

  return (
    <RNText
      {...props}
      className={cn(
        textVariantStyles[variant],
        textColorStyles[color],
        weightClass,
        align && alignStyles[align],
        className
      )}
    />
  )
}
