import type { ReactNode } from 'react'

import { View } from 'react-native'

import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import { Text } from '@/core/components/atoms/Text'
import { useLoopProgress, useOnceProgress } from '@/core/motion'
import { cn } from '@/core/utils/cn'

/** Küçük marka: accent halka + primary daire + "PsikoAl" (b0 · Giriş üst satır). */
export function AuthBrand({ className }: { className?: string }) {
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel="PsikoAl"
      className={cn('flex-row items-center gap-3', className)}
    >
      <View className="h-8 w-11">
        <View className="absolute left-0 top-0 h-8 w-8 rounded-full border-4 border-accent" />
        <View className="absolute left-3.5 top-0 h-8 w-[30px] rounded-full bg-primary" />
      </View>
      <Text className="font-display text-2xl text-fg">PsikoAl</Text>
    </View>
  )
}

const BLOB = 240

/** Sağ üst köşede şekil değiştiren yumuşak leke (`blob`, 6 sn ∞). */
export function AuthBlob() {
  const { t } = useLoopProgress({ duration: 3000, reverse: true })
  const style = useAnimatedStyle(() => {
    const a = t.value
    const r = (from: number, to: number) => BLOB * (from + (to - from) * a)
    return {
      borderTopLeftRadius: r(0.5, 0.4),
      borderTopRightRadius: r(0.4, 0.55),
      borderBottomRightRadius: r(0.55, 0.45),
      borderBottomLeftRadius: r(0.45, 0.5),
    }
  })
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      className="absolute -right-20 -top-20 h-[240px] w-[240px]"
    >
      <Animated.View style={[{ flex: 1, overflow: 'hidden' }, style]}>
        <View className="flex-1 bg-accent-soft" />
      </Animated.View>
    </View>
  )
}

/** `wave`: bir kez el sallar gibi döner (1,6 sn, 0,6 sn gecikme). */
export function Wave({ children }: { children: ReactNode }) {
  const t = useOnceProgress({ duration: 1600, delay: 600 })
  const style = useAnimatedStyle(() => {
    const p = t.value
    // 0 → 20 % 16° → 40 % −8° → 60 % 12° → 80 % 0°
    const keys = [0, 16, -8, 12, 0, 0]
    const i = Math.min(4, Math.floor(p / 0.2))
    const local = (p - i * 0.2) / 0.2
    const from = keys[i] ?? 0
    const to = keys[i + 1] ?? 0
    return { transform: [{ rotate: `${p >= 1 ? 0 : from + (to - from) * local}deg` }] }
  })
  return <Animated.View style={[{ transformOrigin: '10% 90%' }, style]}>{children}</Animated.View>
}
