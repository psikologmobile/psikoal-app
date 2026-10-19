import { View } from 'react-native'

import { DrawCheck, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type CheckboxProps = {
  checked: boolean
  onChange: (next: boolean) => void
  /** Ekran okuyucu etiketi (görünür metin yanında ayrıca verilir). */
  accessibilityLabel: string
  hasError?: boolean
  isDisabled?: boolean
  className?: string
  testID?: string
}

/**
 * Checkbox — 28×28, radius 9. off: border-strong çizgi + surface; on: primary
 * dolgu + çizilen tik (draw-check); error: danger çizgi.
 */
export function Checkbox({
  checked,
  onChange,
  accessibilityLabel,
  hasError = false,
  isDisabled = false,
  className,
  testID,
}: CheckboxProps) {
  const colors = useThemeColors()
  return (
    <PressableScale
      testID={testID}
      onPress={() => onChange(!checked)}
      disabled={isDisabled}
      haptics="selection"
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled: isDisabled }}
      wrapperClassName="self-start"
      className={cn(
        'h-7 w-7 items-center justify-center rounded-checkbox',
        checked ? 'bg-primary' : 'border border-border-strong bg-surface',
        hasError && !checked && 'border-danger',
        isDisabled && 'opacity-50',
        className
      )}
    >
      {checked ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <DrawCheck size={16} color={colors.onPrimary} strokeWidth={3.4} />
        </View>
      ) : null}
    </PressableScale>
  )
}
