import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { DrawCheck, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type ChoiceChipProps = {
  label: string
  selected: boolean
  onPress: () => void
  isDisabled?: boolean
  className?: string
  testID?: string
}

/**
 * ChoiceChip — çoklu seçim. off: border-strong çizgi; on: primary dolgu +
 * çizilen tik. h 44, pill. Uzmanlık alanları.
 */
export function ChoiceChip({
  label,
  selected,
  onPress,
  isDisabled = false,
  className,
  testID,
}: ChoiceChipProps) {
  const colors = useThemeColors()
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      haptics="selection"
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled: isDisabled }}
      wrapperClassName="self-start"
      className={cn(
        'h-11 flex-row items-center justify-center gap-1.5 rounded-full px-4',
        selected ? 'bg-primary' : 'border border-border-strong bg-transparent',
        isDisabled && 'opacity-50',
        className
      )}
    >
      {selected ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <DrawCheck size={14} color={colors.onPrimary} strokeWidth={3.4} />
        </View>
      ) : null}
      <Text
        className={cn(
          'text-body-sm',
          selected ? 'font-body-bold text-primary-fg' : 'font-body-semibold text-fg'
        )}
      >
        {label}
      </Text>
    </PressableScale>
  )
}
