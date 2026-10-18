import { useEffect, useRef } from 'react'

import { View } from 'react-native'

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'

import { EASE_OUT } from './config'
import { useReduceMotion } from './useReduceMotion'

const HEART =
  'M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c2 0 3.4 1.1 4.2 2.3h2C13.8 6.1 15.2 5 17.2 5c3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21z'

export type HeartBurstProps = {
  liked: boolean
  size?: number
  /** Dolu kalp rengi (primary) */
  color: string
  /** Boş kalp çizgi rengi (text-muted) */
  idleColor: string
}

/**
 * `heart` + `burst`: beğenildiğinde kalp 1→1.35→.9→1 (450 ms), çevresinde
 * halka büyüyüp söner (500 ms). Basma davranışını çağıran sağlar.
 */
export function HeartBurst({ liked, size = 22, color, idleColor }: HeartBurstProps) {
  const reduce = useReduceMotion()
  const scale = useSharedValue(1)
  const burst = useSharedValue(0)
  const prev = useRef(liked)

  useEffect(() => {
    const becameLiked = liked && !prev.current
    prev.current = liked
    if (!becameLiked || reduce) return
    scale.value = withSequence(
      withTiming(1.35, { duration: 135 }),
      withTiming(0.9, { duration: 90 }),
      withTiming(1, { duration: 225, easing: EASE_OUT })
    )
    burst.value = 0
    burst.value = withTiming(1, { duration: 500, easing: EASE_OUT })
  }, [liked, reduce, scale, burst])

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const ringStyle = useAnimatedStyle(() => ({
    opacity: burst.value === 0 || burst.value === 1 ? 0 : 1 - burst.value,
    transform: [{ scale: 0.6 + 1.2 * burst.value }],
  }))

  const ring = size * 1.6
  // REASON: boyutlar prop'tan hesaplanır.
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: ring,
            height: ring,
            borderRadius: ring / 2,
            borderWidth: 2,
            borderColor: color,
          },
          ringStyle,
        ]}
      />
      <Animated.View style={heartStyle}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d={HEART}
            fill={liked ? color : 'none'}
            stroke={liked ? color : idleColor}
            strokeWidth={2}
          />
        </Svg>
      </Animated.View>
    </View>
  )
}
