import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { CountRoll } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type StatTileProps = {
  label: string
  /** Biçimli değer ("12", "₺1.250"). */
  value: string | number
  /** surface: varsayılan kutu · accent: vurgulu kutu · outline: çizgili */
  tone?: 'surface' | 'accent' | 'outline'
  /** Rakam açılışta alttan kayarak gelsin (count-roll). */
  animate?: boolean
  delay?: number
  className?: string
}

const toneStyles = {
  surface: { box: 'bg-surface', label: 'text-fg-muted', value: 'text-fg' },
  accent: { box: 'bg-accent', label: 'text-accent-muted', value: 'text-accent-fg' },
  outline: { box: 'border border-border', label: 'text-fg-muted', value: 'text-fg' },
} as const

/** StatTile — etiket + display rakam. Fırsatlar şeridi, Tekliflerim, Bakiyem, Kategori. */
export function StatTile({
  label,
  value,
  tone = 'surface',
  animate = true,
  delay = 0,
  className,
}: StatTileProps) {
  const t = toneStyles[tone]
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className={cn('flex-1 gap-1 rounded-lg p-3.5', t.box, className)}
    >
      <Text className={cn('font-body-semibold text-xs', t.label)}>{label}</Text>
      {animate ? (
        <CountRoll
          value={value}
          delay={delay}
          offset={20}
          className={cn('font-display text-[26px] leading-[30px]', t.value)}
        />
      ) : (
        <Text className={cn('font-display text-[26px] leading-[30px]', t.value)}>{value}</Text>
      )}
    </View>
  )
}
