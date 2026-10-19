import { useEffect } from 'react'

import { Text, View } from 'react-native'

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import { EASE_OUT } from './config'
import { useReduceMotion } from './useReduceMotion'

import { cn } from '@/core/utils/cn'

type CharProps = {
  char: string
  index: number
  delay: number
  charDelay: number
  duration: number
  offset: number
  className?: string
  replayKey?: unknown
}

function RollChar({
  char,
  index,
  delay,
  charDelay,
  duration,
  offset,
  className,
  replayKey,
}: CharProps) {
  const reduce = useReduceMotion()
  const t = useSharedValue(reduce ? 1 : 0)
  useEffect(() => {
    if (reduce) {
      t.value = 1
      return
    }
    t.value = 0
    t.value = withDelay(delay + index * charDelay, withTiming(1, { duration, easing: EASE_OUT }))
  }, [reduce, delay, index, charDelay, duration, t, replayKey])
  const style = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * offset }],
  }))
  return (
    <Animated.View style={style}>
      <Text className={className}>{char}</Text>
    </Animated.View>
  )
}

export type CountRollProps = {
  /** Gösterilecek değer; biçimlendirilmiş metin verin ("₺1.250"). */
  value: string | number
  /** Rakam yazı stili (ör. "font-display text-6xl text-accent-fg"). */
  className?: string
  /** Satır kutusu className'i. */
  containerClassName?: string
  delay?: number
  /** Karakterler arası gecikme (ms). */
  charDelay?: number
  duration?: number
  /** Kayma mesafesi (px) — yazı boyutuna yakın verin. */
  offset?: number
  accessibilityLabel?: string
}

/**
 * `count-roll`: her karakter alttan kayarak gelir (600 ms). Bakiye, istatistik.
 * Değer değişince yeniden oynar. Ekran okuyucu tek metin olarak okur.
 */
export function CountRoll({
  value,
  className,
  containerClassName,
  delay = 0,
  charDelay = 40,
  duration = 600,
  offset = 24,
  accessibilityLabel,
}: CountRollProps) {
  const text = String(value)
  return (
    <View
      className={cn('flex-row overflow-hidden', containerClassName)}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? text}
    >
      {Array.from(text).map((char, i) => (
        <RollChar
          key={`${i}-${char}`}
          char={char}
          index={i}
          delay={delay}
          charDelay={charDelay}
          duration={duration}
          offset={offset}
          className={className}
          replayKey={text}
        />
      ))}
    </View>
  )
}
