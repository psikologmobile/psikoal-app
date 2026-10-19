import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import { DURATION, EASE_OUT, ENTER_OFFSET_X, ENTER_OFFSET_Y, staggerDelay } from './config'
import { useReduceMotion } from './useReduceMotion'

type Axis = 'up' | 'right' | 'left' | 'fade'

export type EnterProps = {
  children?: ReactNode
  /** Sıralı girişte kaçıncı öğe (gecikme = index × 60 ms). */
  index?: number
  /** Ek gecikme (ms). */
  delay?: number
  /** Süre (ms). enter-up 550, enter-right 450. */
  duration?: number
  /** Kayma mesafesi (px). enter-up 18, enter-right 40. */
  offset?: number
  /** Dış yerleşim kutusu className'i (flex-1, w-full, gap …). */
  className?: string
  /** İç Animated.View dış kutuyu doldursun (flex: 1). */
  fill?: boolean
  /** Değiştiğinde giriş yeniden oynar (adım değişimi, yeni öğe). */
  replayKey?: string | number
  style?: StyleProp<ViewStyle>
}

function useEnter(axis: Axis, { index = 0, delay = 0, duration, offset, replayKey }: EnterProps) {
  const reduce = useReduceMotion()
  const dist = offset ?? (axis === 'up' ? ENTER_OFFSET_Y : axis === 'fade' ? 0 : ENTER_OFFSET_X)
  const progress = useSharedValue(reduce ? 1 : 0)

  useEffect(() => {
    if (reduce) {
      progress.value = 1
      return
    }
    progress.value = 0
    progress.value = withDelay(
      staggerDelay(index, delay),
      withTiming(1, {
        duration: duration ?? (axis === 'up' ? DURATION.enter : 450),
        easing: EASE_OUT,
      })
    )
  }, [reduce, index, delay, duration, axis, progress, replayKey])

  return useAnimatedStyle(() => {
    const rest = (1 - progress.value) * dist
    const transform =
      axis === 'up'
        ? [{ translateY: rest }]
        : axis === 'right'
          ? [{ translateX: rest }]
          : axis === 'left'
            ? [{ translateX: -rest }]
            : []
    return { opacity: progress.value, transform }
  })
}

function EnterBase({ axis, ...props }: EnterProps & { axis: Axis }) {
  const animatedStyle = useEnter(axis, props)
  const inner = (
    <Animated.View style={[animatedStyle, props.fill ? { flex: 1 } : null, props.style]}>
      {props.children}
    </Animated.View>
  )
  return props.className ? <View className={props.className}>{inner}</View> : inner
}

/** `enter-up`: opacity 0→1, Y +18→0, 550 ms ease-out, index × 60 ms gecikme. */
export function EnterUp(props: EnterProps) {
  return <EnterBase axis="up" {...props} />
}

/** `enter-right`: X +40→0 + fade, 450 ms. Adım değişimi, yeni öğe. */
export function EnterRight(props: EnterProps) {
  return <EnterBase axis="right" {...props} />
}

/** Soldan giriş (geri adımda). */
export function EnterLeft(props: EnterProps) {
  return <EnterBase axis="left" {...props} />
}

/** Yalnız opaklık (`fade`, 250 ms). */
export function FadeIn(props: EnterProps) {
  return <EnterBase axis="fade" duration={props.duration ?? DURATION.fast} {...props} />
}
