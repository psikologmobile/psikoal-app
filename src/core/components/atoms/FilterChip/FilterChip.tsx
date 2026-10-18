import { Text } from '@/core/components/atoms/Text'
import { PressableScale } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type FilterChipProps = {
  label: string
  selected: boolean
  onPress: () => void
  /** Sayaç ("Yayında · 2"). */
  count?: number
  size?: 'sm' | 'md'
  isDisabled?: boolean
  className?: string
  testID?: string
}

/**
 * FilterChip — tek seçimli süzgeç. off: border-strong çizgi; on: accent zemin /
 * on-accent yazı. h 36–42, pill. İlanlarım, Fırsatlar, Tekliflerim, Bakiyem, Blog.
 */
export function FilterChip({
  label,
  selected,
  onPress,
  count,
  size = 'md',
  isDisabled = false,
  className,
  testID,
}: FilterChipProps) {
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      haptics="selection"
      accessibilityRole="button"
      accessibilityLabel={count !== undefined ? `${label}, ${count}` : label}
      accessibilityState={{ selected, disabled: isDisabled }}
      wrapperClassName="self-start"
      className={cn(
        'flex-row items-center justify-center gap-1.5 rounded-full border',
        size === 'sm' ? 'h-9 px-3' : 'h-10 px-3.5',
        selected ? 'border-accent bg-accent' : 'border-border-strong bg-transparent',
        isDisabled && 'opacity-50',
        className
      )}
    >
      <Text
        className={cn(
          size === 'sm' ? 'text-label' : 'text-body-sm',
          selected ? 'font-body-bold text-accent-fg' : 'font-body-semibold text-fg'
        )}
      >
        {label}
        {count !== undefined ? ` · ${count}` : ''}
      </Text>
    </PressableScale>
  )
}
