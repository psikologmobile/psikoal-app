import { useEffect } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import { EASE_IN_OUT, EASE_OUT } from './config'
import { useReduceMotion } from './useReduceMotion'

import { cn } from '@/core/utils/cn'

/**
 * Sürekli (ambient) döngüler. Hepsi azaltılmış harekette DURUR ve dinlenme
 * karesinde kalır. 0→1 ilerleyen paylaşılan bir değer üretir.
 */
export function useLoopProgress({
  duration,
  delay = 0,
  linear = false,
  reverse = false,
  enabled = true,
}: {
  duration: number
  delay?: number
  linear?: boolean
  /** İleri-geri (yo-yo) */
  reverse?: boolean
  enabled?: boolean
}) {
  const reduce = useReduceMotion()
  const t = useSharedValue(0)
  const active = enabled && !reduce

  useEffect(() => {
    if (!active) {
      cancelAnimation(t)
      t.value = 0
      return
    }
    t.value = 0
    t.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: linear ? Easing.linear : EASE_IN_OUT }),
        -1,
        reverse
      )
    )
    return () => cancelAnimation(t)
  }, [active, delay, duration, linear, reverse, t])

  return { t, active }
}

type LoopBoxProps = {
  children?: ReactNode
  className?: string
  style?: StyleProp<ViewStyle>
  enabled?: boolean
}

function Box({
  className,
  children,
  style,
}: {
  className?: string
  children?: ReactNode
  style: ComponentProps<typeof Animated.View>['style']
}) {
  const inner = <Animated.View style={style}>{children}</Animated.View>
  return className ? <View className={className}>{inner}</View> : inner
}

// ─── pulse-dot ────────────────────────────────────────────────────────────

export type PulseDotProps = {
  /** Nokta çapı (px). Rozet 7, okunmamış 10, hatırlatma ikonu 40. */
  size?: number
  /** Nokta rengi className'i (bg-primary, bg-primary-fg …). */
  colorClassName?: string
  className?: string
  enabled?: boolean
  children?: ReactNode
}

/** `pulse-dot`: nokta 1→2,6 büyür ve söner, 1,6 sn ∞. Yayında, okunmamış, hatırlatma. */
export function PulseDot({
  size = 8,
  colorClassName = 'bg-primary',
  className,
  enabled = true,
  children,
}: PulseDotProps) {
  const { t, active } = useLoopProgress({ duration: 1600, linear: true, enabled })
  const style = useAnimatedStyle(() => {
    const e = EASE_OUT_JS(t.value)
    return { opacity: active ? 0.9 * (1 - e) : 0, transform: [{ scale: 1 + 1.6 * e }] }
  })
  // REASON: boyut prop'tan gelir; className ile sabit ölçü yazılamaz.
  const box = { width: size, height: size }
  return (
    <View className={cn('relative', className)} style={box} accessibilityElementsHidden>
      <Animated.View style={[ABS_FILL, style]}>
        <View className={cn('flex-1 rounded-full', colorClassName)} />
      </Animated.View>
      <View
        className={cn('absolute inset-0 items-center justify-center rounded-full', colorClassName)}
      >
        {children}
      </View>
    </View>
  )
}

const ABS_FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const

/** JS tarafı ease-out (worklet içinde kullanılır). */
function EASE_OUT_JS(x: number) {
  'worklet'
  return 1 - Math.pow(1 - x, 3)
}

// ─── ring ─────────────────────────────────────────────────────────────────

export type RingProps = {
  size: number
  /** Halka çizgi rengi className'i (border-primary, border-accent-line). */
  colorClassName?: string
  borderWidth?: number
  /** Süre (ms) 1200–1800. */
  duration?: number
  delay?: number
  /** Başlangıç / bitiş ölçeği (.7 → 2). */
  from?: number
  to?: number
  /** false: tek sefer (başarı dalgası); true: sonsuz dikkat halkası. */
  loop?: boolean
  className?: string
}

/** `ring`: halka dışa doğru büyüyüp söner. */
export function Ring({
  size,
  colorClassName = 'border-primary',
  borderWidth = 2,
  duration = 1600,
  delay = 0,
  from = 0.7,
  to = 2,
  loop = true,
  className,
}: RingProps) {
  const reduce = useReduceMotion()
  const t = useSharedValue(0)
  useEffect(() => {
    if (reduce) {
      t.value = 0
      return
    }
    t.value = 0
    const once = withTiming(1, { duration, easing: Easing.out(Easing.ease) })
    t.value = withDelay(delay, loop ? withRepeat(once, -1, false) : once)
    return () => cancelAnimation(t)
  }, [reduce, delay, duration, loop, t])

  const style = useAnimatedStyle(() => ({
    opacity: reduce ? 0 : t.value === 0 && !loop ? 0 : 0.9 * (1 - t.value),
    transform: [{ scale: from + (to - from) * t.value }],
  }))
  return (
    // REASON: boyut prop'tan gelir.
    <Animated.View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <View
        className={cn('flex-1 rounded-full', colorClassName, className)}
        style={{ borderWidth }}
      />
    </Animated.View>
  )
}

// ─── bell ─────────────────────────────────────────────────────────────────

/** `bell`: zil sallanır — 2,4 sn ∞, 1 sn gecikme. Keşfet, Fırsatlar, web sidebar. */
export function Bell({ children, className, style, enabled = true }: LoopBoxProps) {
  const { t } = useLoopProgress({ duration: 2400, delay: 1000, linear: true, enabled })
  const animated = useAnimatedStyle(() => {
    const p = t.value
    // 0,40,100% → 0 · 10% → 14° · 20% → −12° · 30% → 8°
    let deg = 0
    if (p < 0.1) deg = (p / 0.1) * 14
    else if (p < 0.2) deg = 14 - ((p - 0.1) / 0.1) * 26
    else if (p < 0.3) deg = -12 + ((p - 0.2) / 0.1) * 20
    else if (p < 0.4) deg = 8 - ((p - 0.3) / 0.1) * 8
    return { transform: [{ rotate: `${deg}deg` }] }
  })
  return (
    <Box className={className} style={[animated, { transformOrigin: '50% 10%' }, style]}>
      {children}
    </Box>
  )
}

// ─── float / breathe ──────────────────────────────────────────────────────

/** `float`: Y 0 ↔ −8 px, 3,2 sn ∞. Boş durum illüstrasyonları. */
export function Float({
  children,
  className,
  style,
  enabled = true,
  distance = 8,
  duration = 3200,
}: LoopBoxProps & { distance?: number; duration?: number }) {
  const { t } = useLoopProgress({ duration: duration / 2, reverse: true, enabled })
  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: -distance * t.value }] }))
  return (
    <Box className={className} style={[animated, style]}>
      {children}
    </Box>
  )
}

/** `breathe`: scale .9 ↔ 1.05, 3,5 sn ∞. Test girişi. */
export function Breathe({
  children,
  className,
  style,
  enabled = true,
  min = 0.9,
  max = 1.05,
  duration = 3500,
}: LoopBoxProps & { min?: number; max?: number; duration?: number }) {
  const { t, active } = useLoopProgress({ duration: duration / 2, reverse: true, enabled })
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: active ? min + (max - min) * t.value : 1 }],
  }))
  return (
    <Box className={className} style={[animated, style]}>
      {children}
    </Box>
  )
}

// ─── orbit / spin / wobble ────────────────────────────────────────────────

/** `orbit`: döner (kesikli halka, uydu nokta), 10–20 sn ∞ doğrusal. */
export function Orbit({
  children,
  className,
  style,
  enabled = true,
  duration = 14000,
  reverseDirection = false,
}: LoopBoxProps & { duration?: number; reverseDirection?: boolean }) {
  const { t } = useLoopProgress({ duration, linear: true, enabled })
  const animated = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(reverseDirection ? -360 : 360) * t.value}deg` }],
  }))
  return (
    <Box className={className} style={[animated, style]}>
      {children}
    </Box>
  )
}

/** `spin`: yükleme halkası, 0,8 sn ∞. Azaltılmış harekette de döner mi? Hayır: durur. */
export function Spin({
  children,
  className,
  style,
  enabled = true,
  duration = 800,
}: LoopBoxProps & { duration?: number }) {
  return (
    <Orbit className={className} style={style} enabled={enabled} duration={duration}>
      {children}
    </Orbit>
  )
}

/** `wobble`: hero köşe dekoru 0 ↔ 90° salınır, 4 sn ∞. */
export function Wobble({
  children,
  className,
  style,
  enabled = true,
  degrees = 90,
  duration = 4000,
}: LoopBoxProps & { degrees?: number; duration?: number }) {
  const { t } = useLoopProgress({ duration: duration / 2, reverse: true, enabled })
  const animated = useAnimatedStyle(() => ({
    transform: [{ rotate: `${degrees * t.value}deg` }],
  }))
  return (
    <Box className={className} style={[animated, style]}>
      {children}
    </Box>
  )
}

// ─── radar (boş durum) ────────────────────────────────────────────────────

/**
 * `radar`: 3 halka sırayla yayılır (2,2 sn ∞, 700 ms arayla) + ortada primary
 * nokta. "Şu an açık ilan yok", "Henüz teklif yok".
 */
export function Radar({ size = 110 }: { size?: number }) {
  const dot = Math.round(size * 0.29)
  return (
    // REASON: boyut prop'tan gelir.
    <View style={{ width: size, height: size }} accessibilityElementsHidden>
      {[0, 700, 1400].map((delay) => (
        <View key={delay} className="absolute inset-0">
          <Ring size={size} from={0.3} to={1.6} duration={2200} delay={delay} />
        </View>
      ))}
      <View className="absolute inset-0 items-center justify-center">
        <View style={{ width: dot, height: dot }} className="rounded-full bg-primary" />
      </View>
    </View>
  )
}

// ─── coin (Bakiyem) ───────────────────────────────────────────────────────

/** `coin`: ₺ rozeti zıplar (Y 0 ↔ −8) ve Y ekseninde döner (0 ↔ 180°), 3 sn ∞. */
export function Coin({
  children,
  className,
  style,
  enabled = true,
  duration = 3000,
}: LoopBoxProps & { duration?: number }) {
  const { t } = useLoopProgress({ duration: duration / 2, reverse: true, enabled })
  const animated = useAnimatedStyle(() => ({
    transform: [
      { perspective: 400 },
      { translateY: -8 * t.value },
      { rotateY: `${180 * t.value}deg` },
    ],
  }))
  return (
    <Box className={className} style={[animated, style]}>
      {children}
    </Box>
  )
}

// ─── skeleton ─────────────────────────────────────────────────────────────

/** `skeleton`: opaklık .4 ↔ 1, 1,2 sn ∞. Parçalar arası 100–150 ms `delay`. */
export function usePulseOpacityStyle(delay = 0, enabled = true) {
  const { t, active } = useLoopProgress({ duration: 600, delay, reverse: true, enabled })
  return useAnimatedStyle(() => ({ opacity: active ? 0.4 + 0.6 * t.value : 0.7 }))
}

// ─── glow (Eşleşti CTA) ───────────────────────────────────────────────────

/** Hafif nabız: scale 1 ↔ 1.04, 2,4 sn ∞. */
export function Glow({
  children,
  className,
  style,
  enabled = true,
  delay = 0,
}: LoopBoxProps & { delay?: number }) {
  const { t, active } = useLoopProgress({ duration: 1200, delay, reverse: true, enabled })
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: active ? 1 + 0.04 * t.value : 1 }],
  }))
  return (
    <Box className={className} style={[animated, style]}>
      {children}
    </Box>
  )
}

/** Tek seferlik ileri hareket ilerlemesi (0→1), azaltılmışta direkt 1. */
export function useOnceProgress({
  duration,
  delay = 0,
  replayKey,
}: {
  duration: number
  delay?: number
  replayKey?: unknown
}) {
  const reduce = useReduceMotion()
  const t = useSharedValue(reduce ? 1 : 0)
  useEffect(() => {
    if (reduce) {
      t.value = 1
      return
    }
    t.value = 0
    t.value = withDelay(delay, withTiming(1, { duration, easing: EASE_OUT }))
  }, [reduce, delay, duration, t, replayKey])
  return t
}
