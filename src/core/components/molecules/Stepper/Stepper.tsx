import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { Pop, PressableScale } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type StepperProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Sayının yanındaki birim ("yıl"). */
  unit?: string
  label?: string
  className?: string
}

/**
 * Stepper — − / + düğmeleri (52×52) ve ortada display 34 sayı. Sınıra
 * gelinen düğme pasifleşir. Uzman onboarding · deneyim yılı.
 */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  unit,
  label,
  className,
}: StepperProps) {
  const atMin = value <= min
  const atMax = value >= max
  return (
    <View className={cn('gap-1.5', className)}>
      {label ? <Text className="font-body-bold text-label text-fg">{label}</Text> : null}
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{
          min,
          max,
          now: value,
          text: unit ? `${value} ${unit}` : String(value),
        }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'increment' && !atMax)
            onChange(Math.min(max, value + step))
          if (e.nativeEvent.actionName === 'decrement' && !atMin)
            onChange(Math.max(min, value - step))
        }}
        className="flex-row items-center gap-3 rounded-xl border border-border-strong bg-surface p-2"
      >
        <PressableScale
          onPress={() => onChange(Math.max(min, value - step))}
          disabled={atMin}
          haptics="selection"
          accessibilityRole="button"
          accessibilityLabel="Azalt"
          accessibilityState={{ disabled: atMin }}
          className={cn(
            'h-13 w-13 items-center justify-center rounded-md bg-bg',
            atMin && 'opacity-40'
          )}
        >
          <Text className="font-body-bold text-2xl text-fg">−</Text>
        </PressableScale>
        <View className="flex-1 flex-row items-baseline justify-center gap-1.5">
          <Pop replayKey={value} duration={300} overshoot={1.08}>
            <Text className="font-display text-h2 text-fg">{value}</Text>
          </Pop>
          {unit ? <Text className="font-body-semibold text-base text-fg-muted">{unit}</Text> : null}
        </View>
        <PressableScale
          onPress={() => onChange(Math.min(max, value + step))}
          disabled={atMax}
          haptics="selection"
          accessibilityRole="button"
          accessibilityLabel="Artır"
          accessibilityState={{ disabled: atMax }}
          className={cn(
            'h-13 w-13 items-center justify-center rounded-md bg-primary',
            atMax && 'opacity-40'
          )}
        >
          <Text className="font-body-bold text-2xl text-primary-fg">+</Text>
        </PressableScale>
      </View>
    </View>
  )
}
