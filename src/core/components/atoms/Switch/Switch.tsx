import { useEffect } from 'react'

import { Pressable, View } from 'react-native'

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { DURATION, EASE_OUT, haptic, useReduceMotion } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type SwitchProps = {
  value: boolean
  onValueChange: (value: boolean) => void
  isDisabled?: boolean
  accessibilityLabel?: string
  className?: string
  testID?: string
}

/**
 * Switch — 46×26, thumb 20 px; açılınca thumb 20 px sağa kayar (250 ms).
 * off: border-strong zemin · on: primary zemin. Thumb bg renginde.
 */
export function Switch({
  value,
  onValueChange,
  isDisabled = false,
  accessibilityLabel,
  className,
  testID,
}: SwitchProps) {
  const reduce = useReduceMotion()
  const x = useSharedValue(value ? 20 : 0)

  useEffect(() => {
    x.value = reduce
      ? value
        ? 20
        : 0
      : withTiming(value ? 20 : 0, { duration: DURATION.fast, easing: EASE_OUT })
  }, [value, reduce, x])

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))

  return (
    <Pressable
      testID={testID}
      onPress={() => {
        haptic.light()
        onValueChange(!value)
      }}
      disabled={isDisabled}
      hitSlop={10}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: isDisabled }}
      className={cn(
        'h-[26px] w-[46px] justify-center rounded-full px-[3px]',
        value ? 'bg-primary' : 'bg-border-strong',
        isDisabled && 'opacity-50',
        className
      )}
    >
      <Animated.View style={thumbStyle}>
        <View className="h-5 w-5 rounded-full bg-bg" />
      </Animated.View>
    </Pressable>
  )
}
