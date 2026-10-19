import type { ReactNode } from 'react'

import { View } from 'react-native'

import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import { Text } from '@/core/components/atoms/Text'
import { DrawCheck, EnterRight, EnterUp, Float, Orbit, Pop, useOnceProgress } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

/** Karşılama gecikmeleri: .d1 120 ms, .d2 240 ms … (b0 · Karşılama). */
const D = [0, 120, 240, 360, 480] as const

function Frame({ children, className }: { children: ReactNode; className: string }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('relative h-full w-full overflow-hidden rounded-phone', className)}
    >
      {children}
    </View>
  )
}

/** `rise`: çubuk alttan yükselir (scaleY 0→1, 800 ms). */
function Rise({ delay, height, className }: { delay: number; height: number; className: string }) {
  const t = useOnceProgress({ duration: 800, delay })
  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: t.value }] }))
  return (
    // REASON: çubuk yüksekliği ve alttan büyüme orijini tasarımdan gelir
    <Animated.View style={[{ width: 40, height, transformOrigin: 'bottom' }, style]}>
      <View className={cn('flex-1 rounded-t-inner', className)} />
    </Animated.View>
  )
}

function Line({ w, h = 8, className }: { w: number; h?: number; className: string }) {
  // REASON: iskelet çizgi ölçüleri tasarımdan birebir
  return <View style={{ width: w, height: h }} className={cn('rounded-full', className)} />
}

/** Slayt 1 — ilan kartı, sağdan gelen teklif kartları, "3 teklif" rozeti. */
export function WelcomeOffersArt() {
  return (
    <Frame className="bg-accent">
      <View className="absolute -right-[70px] -top-[70px]">
        <Orbit duration={18000}>
          <View className="h-[220px] w-[220px] rounded-full border border-dashed border-accent-line" />
        </Orbit>
      </View>
      <EnterUp delay={D[1]} className="absolute left-7 top-10">
        <View className="w-[230px] gap-2.5 rounded-card bg-bg p-[18px]">
          <View className="flex-row items-center gap-2">
            <View className="h-7 w-7 rounded-full bg-accent" />
            <Line w={70} className="bg-border-strong" />
          </View>
          <Line w={180} h={12} className="bg-fg" />
          <Line w={140} className="bg-border-strong" />
          <Line w={160} className="bg-border-strong" />
        </View>
      </EnterUp>
      <EnterRight delay={D[2]} offset={60} className="absolute right-6 top-[200px]">
        <View className="h-14 w-[220px] flex-row items-center gap-2.5 rounded-lg bg-bg px-3">
          <View className="h-8 w-8 rounded-full bg-primary" />
          <View className="gap-1.5">
            <Line w={100} className="bg-fg" />
            <Line w={60} h={6} className="bg-border-strong" />
          </View>
        </View>
      </EnterRight>
      <EnterRight delay={D[3]} offset={60} className="absolute right-12 top-[270px]">
        <View className="h-14 w-[220px] flex-row items-center gap-2.5 rounded-lg bg-accent-soft px-3">
          <View className="h-8 w-8 rounded-full bg-accent" />
          <View className="gap-1.5">
            <Line w={90} className="bg-accent-soft-fg" />
            <Line w={50} h={6} className="bg-accent-line" />
          </View>
        </View>
      </EnterRight>
      <EnterRight delay={D[4]} offset={60} className="absolute right-[72px] top-[340px]">
        <View className="h-14 w-[220px] flex-row items-center gap-2.5 rounded-lg border border-accent-muted px-3">
          <View className="h-8 w-8 rounded-full border border-accent-muted" />
          <Line w={100} className="bg-accent-muted" />
        </View>
      </EnterRight>
      <Pop
        delay={D[3]}
        duration={500}
        overshoot={1.08}
        className="absolute left-[210px] top-[26px]"
      >
        <View className="rounded-full bg-primary px-3 py-1.5">
          <Text className="font-body-bold text-body-sm text-primary-fg">3 teklif</Text>
        </View>
      </Pop>
    </Frame>
  )
}

/** Slayt 2 — dekor daireleri, yükselen çubuklar, yüzen "Kaygı testi · Orta". */
export function WelcomeTestsArt() {
  return (
    <Frame className="bg-accent-soft">
      <Pop duration={500} overshoot={1.08} className="absolute -bottom-[60px] -left-[60px]">
        <View className="h-[240px] w-[240px] rounded-full bg-primary" />
      </Pop>
      <Pop
        delay={D[1]}
        duration={500}
        overshoot={1.08}
        className="absolute right-[30px] top-[30px]"
      >
        <View className="h-[110px] w-[110px] rounded-bl-full bg-accent" />
      </Pop>
      <View className="absolute bottom-[50px] right-10 h-[200px] flex-row items-end gap-3.5">
        <Rise delay={D[1]} height={80} className="bg-accent-line" />
        <Rise delay={D[2]} height={150} className="bg-accent" />
        <Rise delay={D[3]} height={110} className="bg-primary" />
      </View>
      <Float className="absolute left-10 top-[60px]">
        <View className="gap-1 rounded-xl bg-accent px-4 py-3.5">
          <Text variant="overline" className="text-accent-muted">
            Kaygı testi
          </Text>
          <Text className="font-display text-[26px] leading-[30px] text-accent-fg">Orta</Text>
        </View>
      </Float>
    </Frame>
  )
}

/** Slayt 3 — dönen halka, çizilen tik, güven rozetleri. */
export function WelcomeTrustArt() {
  const colors = useThemeColors()
  return (
    <Frame className="items-center justify-center bg-primary">
      <View className="absolute">
        <Orbit duration={18000}>
          <View className="h-[340px] w-[340px] rounded-full border border-dashed border-primary-fg" />
        </Orbit>
      </View>
      <Pop delay={D[1]} duration={500} overshoot={1.08}>
        <View className="h-[200px] w-[200px] items-center justify-center rounded-full bg-accent">
          <DrawCheck
            size={96}
            viewBox="0 0 48 48"
            d="M12 25 l8 8 l16 -18"
            color={colors.onAccent}
            strokeWidth={3.5}
            length={120}
            delay={500}
            duration={700}
          />
        </View>
      </Pop>
      <Pop delay={D[3]} duration={500} overshoot={1.08} className="absolute left-[30px] top-10">
        <View className="rounded-full bg-bg px-3.5 py-2">
          <Text className="font-body-bold text-body-sm text-fg">Lisans doğrulandı</Text>
        </View>
      </Pop>
      <Pop delay={D[4]} duration={500} overshoot={1.08} className="absolute bottom-10 right-[30px]">
        <View className="rounded-full bg-accent px-3.5 py-2">
          <Text className="font-body-bold text-body-sm text-accent-fg">Yalnız senin izninle</Text>
        </View>
      </Pop>
    </Frame>
  )
}
