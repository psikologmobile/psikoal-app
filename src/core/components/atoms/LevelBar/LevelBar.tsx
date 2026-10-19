import { useState } from 'react'

import { View } from 'react-native'

import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import { Text } from '@/core/components/atoms/Text'
import { useAnimatedProgress } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type LevelBarProps = {
  /** İşaretçi konumu 0..1 (0 = en sol). */
  position: number
  /** Bölge etiketleri (3 adet). */
  labels?: [string, string, string]
  accessibilityLabel?: string
  className?: string
}

const ZONES = ['bg-accent-soft', 'bg-accent', 'bg-accent-line'] as const

/**
 * LevelBar — 3 bölge + soldan konumuna kayan işaretçi (`marker-slide`,
 * 1,2 sn, 600 ms gecikme). Test sonucu.
 */
export function LevelBar({
  position,
  labels = ['Düşük', 'Orta', 'Yüksek'],
  accessibilityLabel,
  className,
}: LevelBarProps) {
  const [width, setWidth] = useState(0)
  const p = useAnimatedProgress(position, { duration: 1200, delay: 600 })
  const markerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: p.value * width - 10 }],
  }))

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(position * 100) }}
      className={cn('gap-1.5', className)}
    >
      <View
        className="relative h-2.5 flex-row gap-1"
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {ZONES.map((z) => (
          <View key={z} className={cn('flex-1 rounded-[5px]', z)} />
        ))}
        <Animated.View style={[{ position: 'absolute', top: -5, left: 0 }, markerStyle]}>
          <View className="h-5 w-5 rounded-full border-3 border-bg bg-primary" />
        </Animated.View>
      </View>
      <View className="flex-row justify-between">
        {labels.map((l) => (
          <Text key={l} className="font-body-semibold text-xs text-fg-muted">
            {l}
          </Text>
        ))}
      </View>
    </View>
  )
}
