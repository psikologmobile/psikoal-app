import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

export type InfoTileProps = {
  label: string
  value: string
  /** Değer display yazıyla (seans ücreti). */
  emphasis?: boolean
  className?: string
}

/** InfoTile — küçük etiket + kalın değer, surface kutu (tasarım: İlan özeti, Eşleşme 3'lü ızgara). */
export function InfoTile({ label, value, emphasis = false, className }: InfoTileProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className={cn('flex-1 gap-0.5 rounded-lg bg-surface px-3.5 py-3', className)}
    >
      <Text className="text-xs text-fg-muted">{label}</Text>
      <Text
        className={cn(
          'text-fg',
          emphasis ? 'font-display text-[22px] leading-7' : 'font-body-bold text-body'
        )}
      >
        {value}
      </Text>
    </View>
  )
}
