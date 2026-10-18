import { Pressable, View } from 'react-native'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

/**
 * @deprecated v1 çipi. Yeni kodda `FilterChip` (tek seçim), `ChoiceChip`
 * (çoklu seçim) veya `TagChip` (etkileşimsiz meta) kullan. Görünüm v2'ye eşlendi.
 */
export type ChipVariant = 'filter' | 'input' | 'tag' | 'session' | 'price' | 'onBrand'
export type ChipSize = 'sm' | 'md'

export type ChipProps = {
  label: string
  isSelected?: boolean
  onPress?: () => void
  onRemove?: () => void
  isDisabled?: boolean
  variant?: ChipVariant
  size?: ChipSize
  className?: string
}

const selectedStyles: Record<ChipVariant, string> = {
  filter: 'bg-accent',
  input: 'bg-accent',
  tag: 'bg-accent-soft',
  session: 'bg-surface',
  price: 'bg-accent-soft',
  onBrand: 'bg-bg',
}

const selectedText: Record<ChipVariant, string> = {
  filter: 'text-accent-fg',
  input: 'text-accent-fg',
  tag: 'text-accent-soft-fg',
  session: 'text-fg',
  price: 'text-accent-soft-fg',
  onBrand: 'text-fg',
}

export function Chip({
  label,
  isSelected = false,
  onPress,
  onRemove,
  isDisabled = false,
  variant = 'filter',
  size = 'sm',
  className,
}: ChipProps) {
  const colors = useThemeColors()
  const containerStyle = cn(
    'flex-row items-center self-start rounded-full',
    size === 'md' ? 'gap-2 px-3.5 py-2' : 'gap-1.5 px-3 py-1.5',
    isSelected ? selectedStyles[variant] : 'border border-border-strong',
    isDisabled && 'opacity-40',
    className
  )
  const textClass = cn(
    size === 'md' ? 'text-body-sm' : 'text-xs',
    isSelected ? cn('font-body-bold', selectedText[variant]) : 'font-body-semibold text-fg'
  )

  const content = (
    <>
      <Text className={textClass}>{label}</Text>
      {onRemove && (isSelected || variant === 'input') ? (
        <Pressable
          onPress={isDisabled ? undefined : onRemove}
          accessibilityLabel={`${label} kaldır`}
          accessibilityRole="button"
          disabled={isDisabled}
          hitSlop={8}
        >
          <Icon
            name="X"
            size={size === 'md' ? 14 : 12}
            color={colors.textMuted}
            strokeWidth={2.4}
          />
        </Pressable>
      ) : null}
    </>
  )

  if (onPress) {
    return (
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected, disabled: isDisabled }}
        disabled={isDisabled}
        className={containerStyle}
      >
        {content}
      </Pressable>
    )
  }

  return (
    <View className={containerStyle} accessibilityRole="none">
      {content}
    </View>
  )
}
