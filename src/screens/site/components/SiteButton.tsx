import { Pressable } from 'react-native'

import { SiteLink } from './SiteLink'

import { Spinner } from '@/core/components/atoms/Spinner'
import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

export type SiteButtonVariant = 'primary' | 'ghost' | 'dark'
export type SiteButtonSize = 'md' | 'lg'

type CommonProps = {
  label: string
  variant?: SiteButtonVariant
  size?: SiteButtonSize
  className?: string
  accessibilityLabel?: string
  testID?: string
}

export type SiteButtonProps = CommonProps &
  (
    | { href: string; onPress?: never; isLoading?: never; isDisabled?: never }
    | { href?: never; onPress: () => void; isLoading?: boolean; isDisabled?: boolean }
  )

const variantStyles: Record<SiteButtonVariant, { box: string; text: string }> = {
  primary: { box: 'bg-primary', text: 'text-primary-fg' },
  ghost: { box: 'border border-border-strong bg-transparent', text: 'text-fg' },
  dark: { box: 'bg-fg', text: 'text-bg' },
}

const sizeStyles: Record<SiteButtonSize, string> = {
  md: 'h-12 px-5',
  lg: 'h-14 px-5',
}

/** Site düğmesi (tasarım `.btn .pri/.gho`): 48/56 px, radius 14, Figtree 800 15 px. */
export function SiteButton(props: SiteButtonProps) {
  const { label, variant = 'primary', size = 'md', className, accessibilityLabel, testID } = props
  const styles = variantStyles[variant]
  const box = cn(
    'flex-row items-center justify-center gap-2 rounded-md',
    styles.box,
    sizeStyles[size],
    className
  )
  const text = (
    <Text className={cn('font-body-heavy text-[15px] leading-5', styles.text)}>{label}</Text>
  )

  if (props.href !== undefined) {
    return (
      <SiteLink
        href={props.href}
        className={box}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        {text}
      </SiteLink>
    )
  }

  const disabled = props.isDisabled || props.isLoading
  return (
    <Pressable
      onPress={props.onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled), busy: Boolean(props.isLoading) }}
      testID={testID}
      className={cn('site-press', box, props.isDisabled && 'opacity-50')}
    >
      {props.isLoading ? <Spinner size={18} /> : null}
      {text}
    </Pressable>
  )
}
