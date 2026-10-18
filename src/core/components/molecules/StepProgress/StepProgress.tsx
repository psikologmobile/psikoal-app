import { useEffect, useState } from 'react'

import { View } from 'react-native'

import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { Text } from '@/core/components/atoms/Text'

export type StepProgressProps = {
  current: number
  total: number
  label?: string
}

const FILL_TIMING = { duration: 420, easing: Easing.out(Easing.cubic) }

/** @deprecated → atoms/ProgressSegments (parçalı adım çubuğu). */
export function StepProgress({ current, total, label }: StepProgressProps) {
  const reducedMotion = useReducedMotion()
  const [trackWidth, setTrackWidth] = useState(0)
  const fill = useSharedValue(0)

  useEffect(() => {
    const ratio = total > 0 ? Math.min(Math.max(current / total, 0), 1) : 0
    const target = trackWidth * ratio
    fill.value = reducedMotion ? target : withTiming(target, FILL_TIMING)
  }, [current, total, trackWidth, reducedMotion, fill])

  const fillStyle = useAnimatedStyle(() => ({ width: fill.value }))

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        {label ? (
          <Text variant="caption" className="font-body-bold text-fg-muted">
            {label}
          </Text>
        ) : (
          <View />
        )}
        <Text variant="caption" className="font-body-bold text-fg-muted">
          {current}/{total}
        </Text>
      </View>
      <View
        className="h-1.5 overflow-hidden rounded-full bg-border"
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: current }}
      >
        <Animated.View style={[{ height: '100%' }, fillStyle]}>
          <View className="flex-1 rounded-full bg-primary" />
        </Animated.View>
      </View>
    </View>
  )
}
