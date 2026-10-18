import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { PulseDot } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type StatusPillVariant = 'live' | 'soft' | 'matched' | 'neutral' | 'danger'

export type StatusPillProps = {
  label: string
  variant?: StatusPillVariant
  /** live varyantında nabız noktasını gizle. */
  hideDot?: boolean
  className?: string
}

const containerStyles: Record<StatusPillVariant, string> = {
  live: 'bg-primary px-2.5 py-[5px]',
  soft: 'bg-accent-soft px-2.5 py-[5px]',
  matched: 'bg-accent px-2.5 py-[5px]',
  neutral: 'border border-border-strong px-2.5 py-1',
  danger: 'border border-danger bg-danger-soft px-2.5 py-1',
}

const textStyles: Record<StatusPillVariant, string> = {
  live: 'text-primary-fg font-body-heavy',
  soft: 'text-accent-soft-fg font-body-bold',
  matched: 'text-accent-fg font-body-bold',
  neutral: 'text-fg-muted font-body-bold',
  danger: 'text-danger-soft-fg font-body-bold',
}

/**
 * StatusPill — durum rozeti (12 px / 700–800, pill).
 * live: Yayında, Bekleyen (nabızlı) · soft: Onay bekliyor, Gönderildi ·
 * matched: Eşleşti, Seçildi · neutral: Süresi doldu, Kapandı, Geri çekildi ·
 * danger: Reddedildi.
 */
export function StatusPill({
  label,
  variant = 'soft',
  hideDot = false,
  className,
}: StatusPillProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      className={cn(
        'flex-row items-center gap-1.5 self-start rounded-full',
        containerStyles[variant],
        className
      )}
    >
      {variant === 'live' && !hideDot ? <PulseDot size={7} colorClassName="bg-primary-fg" /> : null}
      <Text className={cn('text-badge', textStyles[variant])}>{label}</Text>
    </View>
  )
}
