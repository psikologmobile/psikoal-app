import { useEffect, useState } from 'react'

import { Pressable, View } from 'react-native'

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import type { IconName } from '@/core/components/atoms/Icon'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { DURATION, EASE_OUT, haptic, useReduceMotion } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type SegmentedOption<T extends string> = (
  | { value: T }
  | { /** @deprecated → value */ key: T }
) & {
  label: string
  /** Seçiliyken etiketin solunda görünen ikon (Görünüm: güneş/ay). */
  icon?: IconName
}

/** @deprecated → SegmentedOption */
export type SegmentedControlOption<T extends string> = SegmentedOption<T>

function optValue<T extends string>(o: SegmentedOption<T>): T {
  return 'value' in o ? o.value : o.key
}

export type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  /** md 40 · lg 46 yükseklik. */
  size?: 'md' | 'lg'
  accessibilityLabel?: string
  className?: string
}

const PAD = 4

/**
 * SegmentedControl — 2–3 seçenek, kayan seçili hap (`tab-pill`, 300 ms).
 * surface zemin, primary hap, radius 14 (hap 10). Görüşme şekli, Aktif/Geçmiş,
 * Görünüm, Mesleki/Belgeler, SSS sekmeleri.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  accessibilityLabel,
  className,
}: SegmentedControlProps<T>) {
  const colors = useThemeColors()
  const reduce = useReduceMotion()
  const [width, setWidth] = useState(0)
  const count = Math.max(1, options.length)
  const segW = width > 0 ? (width - PAD * 2) / count : 0
  const index = Math.max(
    0,
    options.findIndex((o) => optValue(o) === value)
  )
  const x = useSharedValue(index * segW)

  useEffect(() => {
    const target = index * segW
    x.value =
      reduce || segW === 0
        ? target
        : withTiming(target, { duration: DURATION.tab, easing: EASE_OUT })
  }, [index, segW, reduce, x])

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      className={cn('relative flex-row rounded-md bg-surface p-1', className)}
    >
      {segW > 0 ? (
        <Animated.View
          pointerEvents="none"
          // REASON: hap genişliği ölçülen kapsayıcıdan hesaplanır
          style={[
            { position: 'absolute', top: PAD, bottom: PAD, left: PAD, width: segW },
            pillStyle,
          ]}
        >
          <View className="flex-1 rounded-inner bg-primary" />
        </Animated.View>
      ) : null}
      {options.map((o) => {
        const v = optValue(o)
        const on = v === value
        return (
          <Pressable
            key={v}
            onPress={() => {
              if (!on) {
                haptic.selection()
                onChange(v)
              }
            }}
            accessibilityRole="radio"
            accessibilityLabel={o.label}
            accessibilityState={{ checked: on }}
            className={cn(
              'flex-1 flex-row items-center justify-center gap-1.5',
              size === 'lg' ? 'h-[38px]' : 'h-8'
            )}
          >
            {on && o.icon ? (
              <Icon name={o.icon} size={15} color={colors.onPrimary} strokeWidth={2.2} />
            ) : null}
            <Text className={cn('font-body-bold text-body-sm', on ? 'text-primary-fg' : 'text-fg')}>
              {o.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
