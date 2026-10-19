import { useEffect } from 'react'

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Path, Rect } from 'react-native-svg'

import { useReduceMotion } from './useReduceMotion'

export type CopyTickProps = {
  /** true iken tik gösterilir (çağıran 1,4 sn sonra false yapar — useCopyToClipboard). */
  copied: boolean
  color: string
  size?: number
}

/** `copy-tick`: kopyala ikonu tike döner (scale 1→1.25→1, 300 ms). */
export function CopyTick({ copied, color, size = 18 }: CopyTickProps) {
  const reduce = useReduceMotion()
  const s = useSharedValue(1)
  useEffect(() => {
    if (!copied || reduce) return
    s.value = withSequence(withTiming(1.25, { duration: 150 }), withTiming(1, { duration: 150 }))
  }, [copied, reduce, s])
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }))

  return (
    <Animated.View style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {copied ? (
          <Path
            d="M5 12l5 5 9-10"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <Rect x={9} y={9} width={12} height={12} rx={2} stroke={color} strokeWidth={2} />
            <Path
              d="M5 15V5a2 2 0 0 1 2-2h8"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </>
        )}
      </Svg>
    </Animated.View>
  )
}
