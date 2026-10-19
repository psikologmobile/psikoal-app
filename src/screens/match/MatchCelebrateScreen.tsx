import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { View } from 'react-native'

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'

import { Button } from '@/core/components/atoms/Button'
import { Text } from '@/core/components/atoms/Text'
import { Screen } from '@/core/components/templates/Screen'
import {
  Confetti,
  DrawCheck,
  EASE_SPRING,
  EnterUp,
  Glow,
  haptic,
  Pop,
  PressableScale,
  Ring,
  useReduceMotion,
} from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { getInitials } from '@/core/utils/personName'
import { useAuthStore } from '@/domains/auth'
import {
  offerPriceLabel,
  sessionLabel,
  toMatchCounterpart,
  useCelebratedMatchesStore,
  useMatchDetailQuery,
} from '@/domains/match'

/** `slide-in-l/r`: avatar ±160 px'ten yaylanarak gelir (900 ms, 200 ms gecikme). */
function SlideAvatar({
  from,
  runKey,
  children,
}: {
  from: number
  runKey: number
  children: ReactNode
}) {
  const reduce = useReduceMotion()
  const t = useSharedValue(reduce ? 1 : 0)
  useEffect(() => {
    if (reduce) {
      t.value = 1
      return
    }
    t.value = 0
    t.value = withDelay(200, withTiming(1, { duration: 900, easing: EASE_SPRING }))
  }, [reduce, runKey, t])
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: from * (1 - t.value) }] }))
  return <Animated.View style={style}>{children}</Animated.View>
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-0.5 rounded-md bg-bg p-2.5">
      <Text className="text-xs text-fg-muted">{label}</Text>
      <Text numberOfLines={1} className="font-body-bold text-body text-fg">
        {value}
      </Text>
    </View>
  )
}

/**
 * Eşleşti anı (b0 / b5 · Eşleşti): avatarlar birleşir → çift halka → tik
 * dairesi pop + çizim → konfeti → sıralı metin ve kart. Eşleşme başına cihazda
 * bir kez gösterilir; sonrakilerde doğrudan eşleşme detayına gider.
 */
export function MatchCelebrateScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const colors = useThemeColors()
  const user = useAuthStore((s) => s.user)
  const isClient = user?.role === 'client'
  const markCelebrated = useCelebratedMatchesStore((s) => s.markCelebrated)
  // Karar açılışta bir kez verilir: işaretleme sonrası yeniden çizim yönlendirmesin.
  const [alreadySeen] = useState(() => useCelebratedMatchesStore.getState().ids.includes(id))
  const [runKey, setRunKey] = useState(0)
  const { data: match } = useMatchDetailQuery(id)

  useEffect(() => {
    if (alreadySeen || !id) return
    markCelebrated(id)
    const t = setTimeout(() => haptic.success(), 1050)
    return () => clearTimeout(t)
  }, [alreadySeen, id, markCelebrated])

  if (alreadySeen) return <Redirect href={`/match/${id}` as never} />

  const other = match ? toMatchCounterpart(match, isClient ? 'client' : 'expert') : null
  const otherSub = match
    ? isClient
      ? other?.subtitle
      : ['Danışan', match.listing?.title].filter(Boolean).join(' · ')
    : null
  const price = offerPriceLabel(match?.offer?.price)
  const session = sessionLabel(match?.offer?.sessionType)
  const area = match?.listing?.specialization[0]
  const goDetail = () => router.replace(`/match/${id}` as never)

  return (
    <View className="flex-1 bg-bg">
      <Screen testID="screen-match-celebrate" contentClassName="flex-1 items-center gap-8">
        <View className="h-20" />
        <View
          className="h-[150px] w-[260px]"
          accessible
          accessibilityLabel={other ? `${other.name} ile eşleştiniz` : 'Eşleştiniz'}
        >
          <View className="absolute left-2.5 top-0">
            <SlideAvatar from={-160} runKey={runKey}>
              <View className="h-[150px] w-[150px] items-center justify-center rounded-full bg-accent">
                <Text className="font-display text-hero text-accent-fg">
                  {getInitials(user) || '·'}
                </Text>
              </View>
            </SlideAvatar>
          </View>
          <View className="absolute right-2.5 top-0">
            <SlideAvatar from={160} runKey={runKey}>
              <View className="h-[150px] w-[150px] items-center justify-center rounded-full border-[6px] border-bg bg-primary">
                <Text className="font-display text-hero text-primary-fg">
                  {other?.initials ?? ''}
                </Text>
              </View>
            </SlideAvatar>
          </View>
          <View className="absolute left-[100px] top-[45px]">
            <Ring
              key={`r1${runKey}`}
              size={60}
              from={0.8}
              to={2.2}
              duration={1200}
              delay={1100}
              loop={false}
            />
          </View>
          <View className="absolute left-[100px] top-[45px]">
            <Ring
              key={`r2${runKey}`}
              size={60}
              from={0.8}
              to={2.2}
              duration={1200}
              delay={1400}
              loop={false}
              colorClassName="border-accent-line"
            />
          </View>
          <Pop
            delay={1050}
            duration={500}
            overshoot={1.15}
            replayKey={runKey}
            className="absolute left-[100px] top-[45px]"
          >
            <View className="h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-fg bg-bg">
              <DrawCheck
                size={30}
                viewBox="0 0 48 48"
                d="M12 25l8 8 16-17"
                color={colors.text}
                strokeWidth={5}
                length={60}
                delay={1350}
                duration={400}
                replayKey={runKey}
              />
            </View>
          </Pop>
        </View>

        <View className="items-center gap-2.5">
          <EnterUp delay={1200} replayKey={runKey}>
            <Text
              accessibilityRole="header"
              align="center"
              className="font-display text-[52px] leading-[52px] text-fg"
            >
              Eşleştiniz.
            </Text>
          </EnterUp>
          <EnterUp delay={1350} replayKey={runKey}>
            <Text align="center" className="text-lg text-fg-muted">
              Görüşmeleriniz için kolaylıklar dileriz.
            </Text>
          </EnterUp>
        </View>

        {other ? (
          <EnterUp delay={1500} replayKey={runKey} className="w-full">
            <View className="gap-3.5 rounded-panel border border-border bg-surface p-5">
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <Text className="font-body-heavy text-base text-primary-fg">
                    {other.initials}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-display-bold text-xl text-fg">{other.name}</Text>
                  {otherSub ? (
                    <Text numberOfLines={1} className="text-label text-fg-muted">
                      {otherSub}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View className="flex-row gap-2">
                <Stat label="Seans" value={price ?? '—'} />
                <Stat label="Görüşme" value={session ?? '—'} />
                <Stat label="Alan" value={area ?? '—'} />
              </View>
            </View>
          </EnterUp>
        ) : null}

        <EnterUp delay={1650} replayKey={runKey} className="mt-auto w-full gap-1.5">
          <Glow delay={2400}>
            <Button
              testID="celebrate-go"
              label="Eşleşmeye git"
              onPress={goDetail}
              size="xl"
              fullWidth
            />
          </Glow>
          <PressableScale
            onPress={() => setRunKey((k) => k + 1)}
            accessibilityRole="button"
            accessibilityLabel="Animasyonu tekrar oynat"
            className="h-11 items-center justify-center"
          >
            <Text className="font-body-semibold text-body-sm text-fg-muted">
              Animasyonu tekrar oynat
            </Text>
          </PressableScale>
        </EnterUp>
      </Screen>
      <Confetti key={runKey} runKey={runKey} delay={1000} duration={3200} />
    </View>
  )
}
