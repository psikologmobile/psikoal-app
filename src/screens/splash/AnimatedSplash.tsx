import { useEffect, useRef, useState } from 'react'

import { Pressable, View } from 'react-native'

import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@/core/components/atoms/Text'
import { EASE_OUT, Orbit, Ring, useLoopProgress, useReduceMotion } from '@/core/motion'

/** Splash sıralaması (animations.md §5 · b0 Açılış). */
const RING_EASE = Easing.bezier(0.3, 1.4, 0.5, 1)
const TIMING = {
  ring: { delay: 100, duration: 700 },
  disc: { delay: 550, duration: 800 },
  word: { delay: 900, duration: 600 },
  tagline: { delay: 1050, duration: 600 },
  loader: { delay: 1400, duration: 600 },
} as const
/** Logo + yazı göründükten sonra en az bu kadar kalır (ms). */
export const SPLASH_MIN_MS = 1500
export const SPLASH_MIN_MS_REDUCED = 400
const FADE_OUT_MS = 250

export type AnimatedSplashProps = {
  /** Oturum ve depolar hazır mı? Hazır değilse nokta yükleyici döner. */
  ready: boolean
  /** Çıkış animasyonu bitti; katman kaldırılabilir. */
  onDone: () => void
}

function useUp(delay: number, duration: number, reduce: boolean, distance = 16) {
  const t = useSharedValue(reduce ? 1 : 0)
  useEffect(() => {
    if (reduce) {
      t.value = 1
      return
    }
    t.value = withDelay(delay, withTiming(1, { duration, easing: EASE_OUT }))
  }, [delay, duration, reduce, t])
  return useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * distance }],
  }))
}

function LoaderDot({ delay }: { delay: number }) {
  const { t, active } = useLoopProgress({ duration: 1200, delay, linear: true })
  const style = useAnimatedStyle(() => {
    // 0–40 % büyür, 40–80 % küçülür, sonra bekler (CSS `dot` keyframe'i)
    const p = t.value
    const k = p < 0.4 ? p / 0.4 : p < 0.8 ? 1 - (p - 0.4) / 0.4 : 0
    return {
      opacity: active ? 0.4 + 0.6 * k : 1,
      transform: [{ scale: active ? 0.6 + 0.4 * k : 1 }],
    }
  })
  return (
    <Animated.View style={style}>
      <View className="h-2.5 w-2.5 rounded-full bg-primary" />
    </Animated.View>
  )
}

/**
 * Açılış (b0/b4 Açılış) — yalnız soğuk açılışta, yazı tipleri yüklendikten
 * sonra kök düzenin üstüne çizilir: halka yaylanarak döner → marka dairesi
 * sağdan kayar → "Psikosirius" yukarı → nokta yükleyici. Oturum hazır ve en kısa
 * süre dolunca söner. Azaltılmış harekette animasyonsuz, kısa gösterilir.
 */
export function AnimatedSplash({ ready, onDone }: AnimatedSplashProps) {
  const reduce = useReduceMotion()
  const insets = useSafeAreaInsets()
  const [minElapsed, setMinElapsed] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const leaving = useRef(false)

  const ring = useSharedValue(reduce ? 1 : 0)
  const disc = useSharedValue(reduce ? 1 : 0)
  const discOpacity = useSharedValue(reduce ? 1 : 0)
  const fade = useSharedValue(1)

  useEffect(() => {
    if (reduce) return
    ring.value = withDelay(
      TIMING.ring.delay,
      withTiming(1, { duration: TIMING.ring.duration, easing: RING_EASE })
    )
    // %60'ta −6 px taşar, sonra yerine oturur
    disc.value = withDelay(
      TIMING.disc.delay,
      withSequence(
        withTiming(1.075, { duration: TIMING.disc.duration * 0.6, easing: EASE_OUT }),
        withTiming(1, { duration: TIMING.disc.duration * 0.4, easing: EASE_OUT })
      )
    )
    discOpacity.value = withDelay(
      TIMING.disc.delay,
      withTiming(1, { duration: TIMING.disc.duration * 0.6 })
    )
  }, [reduce, ring, disc, discOpacity])

  useEffect(() => {
    const timer = setTimeout(
      () => setMinElapsed(true),
      reduce ? SPLASH_MIN_MS_REDUCED : SPLASH_MIN_MS
    )
    return () => clearTimeout(timer)
  }, [reduce])

  useEffect(() => {
    if (!(ready && (minElapsed || skipped)) || leaving.current) return
    leaving.current = true
    if (reduce) {
      onDone()
      return
    }
    fade.value = withTiming(0, { duration: FADE_OUT_MS }, (finished) => {
      if (finished) runOnJS(onDone)()
    })
  }, [ready, minElapsed, skipped, reduce, fade, onDone])

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ring.value }, { rotate: `${-90 * (1 - ring.value)}deg` }],
  }))
  // disc 0→1.075→1 : X 80 → −6 → 0
  const discStyle = useAnimatedStyle(() => ({
    opacity: discOpacity.value,
    transform: [{ translateX: 80 * (1 - disc.value) }],
  }))
  const wordStyle = useUp(TIMING.word.delay, TIMING.word.duration, reduce)
  const taglineStyle = useUp(TIMING.tagline.delay, TIMING.tagline.duration, reduce)
  const loaderStyle = useUp(TIMING.loader.delay, TIMING.loader.duration, reduce)
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }))

  return (
    <Animated.View
      testID="animated-splash"
      // REASON: tam ekran kaplama; konum ve opaklık animasyonla verilir
      style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, fadeStyle]}
    >
      <View
        accessible
        accessibilityLabel="Psikosirius açılıyor"
        className="flex-1 items-center justify-center overflow-hidden bg-accent"
      >
        <View className="absolute" pointerEvents="none">
          <Orbit duration={14000}>
            <View className="h-[620px] w-[620px] rounded-full border border-dashed border-accent-line" />
          </Orbit>
        </View>
        <View
          pointerEvents="none"
          className="absolute h-[360px] w-[360px] rounded-full border border-accent-line"
        />

        {/* Logo: halka + kayan marka dairesi + iki dalga */}
        <View className="h-[100px] w-[140px]" accessibilityElementsHidden>
          <View className="absolute left-[50px] top-[10px]">
            <Ring size={80} from={0.4} to={3.2} duration={2400} delay={1000} />
          </View>
          <View className="absolute left-[50px] top-[10px]">
            <Ring
              size={80}
              from={0.4}
              to={3.2}
              duration={2400}
              delay={1800}
              colorClassName="border-accent-muted"
            />
          </View>
          <Animated.View
            style={[{ position: 'absolute', left: 0, top: 0, width: 100, height: 100 }, ringStyle]}
          >
            <View className="flex-1 rounded-full border-[12px] border-accent-fg" />
          </Animated.View>
          <Animated.View
            style={[{ position: 'absolute', left: 44, top: 0, width: 96, height: 100 }, discStyle]}
          >
            <View className="flex-1 rounded-full bg-primary" />
          </Animated.View>
        </View>

        <Animated.View style={wordStyle}>
          <Text className="mt-9 font-display text-6xl tracking-tight text-accent-fg">
            Psikosirius
          </Text>
        </Animated.View>
        <Animated.View style={taglineStyle}>
          <Text className="mt-2 text-lg text-accent-muted">Doğru uzmanla buluş.</Text>
        </Animated.View>

        <Animated.View
          // REASON: alttan 96 px + güvenli alan
          style={[{ position: 'absolute', bottom: 96 + insets.bottom / 2 }, loaderStyle]}
        >
          <View className="items-center gap-[18px]">
            <View
              className="flex-row gap-2"
              accessibilityRole="progressbar"
              accessibilityLabel="Yükleniyor"
            >
              <LoaderDot delay={0} />
              <LoaderDot delay={150} />
              <LoaderDot delay={300} />
            </View>
            <Pressable
              onPress={() => setSkipped(true)}
              accessibilityRole="button"
              accessibilityLabel="Dokun, devam et"
              hitSlop={8}
              className="min-h-11 justify-center px-4 py-2.5"
            >
              <Text className="font-body-semibold text-body-sm text-accent-muted">
                Dokun, devam et
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  )
}
