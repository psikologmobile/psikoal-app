import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { Pop, PressableScale } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type StarRatingProps = {
  value: number
  onChange: (value: number) => void
  max?: number
  /** md 48 · lg 52 kare. */
  size?: 'md' | 'lg'
  isDisabled?: boolean
  accessibilityLabel?: string
  className?: string
}

/**
 * StarRating — 1–5 seçim. boş: border-strong çizgi; dolu: primary zemin + pop.
 * 48–52 kare, radius 14. Eşleşme detayı · değerlendirme.
 */
export function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  isDisabled = false,
  accessibilityLabel = 'Puan',
  className,
}: StarRatingProps) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className={cn('flex-row gap-1.5', className)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1
        const on = n <= value
        const box = cn(
          'items-center justify-center rounded-md',
          size === 'lg' ? 'h-13 w-13' : 'h-12 w-12',
          on ? 'bg-primary' : 'border border-border-strong bg-transparent'
        )
        const star = (
          <Text className={cn('text-2xl', on ? 'text-primary-fg' : 'text-fg-muted')}>★</Text>
        )
        return (
          <PressableScale
            key={n}
            onPress={() => onChange(n)}
            disabled={isDisabled}
            haptics="selection"
            scaleTo={0.92}
            accessibilityRole="radio"
            accessibilityLabel={`${n} yıldız`}
            accessibilityState={{ checked: n === value, disabled: isDisabled }}
          >
            {on ? (
              <Pop replayKey={value} delay={i * 40}>
                <View className={box}>{star}</View>
              </Pop>
            ) : (
              <View className={box}>{star}</View>
            )}
          </PressableScale>
        )
      })}
    </View>
  )
}
