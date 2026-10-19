import { useState } from 'react'

import { View } from 'react-native'

import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import { useRouter } from 'expo-router'

import type { MatchTab } from '@/domains/match'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { SegmentedControl } from '@/core/components/molecules/SegmentedControl'
import { Screen } from '@/core/components/templates/Screen'
import { useRefresh } from '@/core/hooks'
import { EnterUp, useLoopProgress } from '@/core/motion'
import { getInitials } from '@/core/utils/personName'
import { useAuthStore } from '@/domains/auth'
import { MATCH_TAB_STATUSES, MatchCard, useMatchesQuery } from '@/domains/match'

/** Boş durum: iki daire birbirine yaklaşıp uzaklaşır (`meet`, 2,2 sn ∞). */
function MeetingCircles() {
  const { t } = useLoopProgress({ duration: 1100, reverse: true })
  const left = useAnimatedStyle(() => ({ transform: [{ translateX: 10 * t.value }] }))
  const right = useAnimatedStyle(() => ({ transform: [{ translateX: -10 * t.value }] }))
  return (
    <View className="flex-row" accessibilityElementsHidden>
      <Animated.View style={left}>
        <View className="h-16 w-16 rounded-full bg-accent" />
      </Animated.View>
      <Animated.View style={[{ marginLeft: -14 }, right]}>
        <View className="h-16 w-16 rounded-full border-4 border-bg bg-primary" />
      </Animated.View>
    </View>
  )
}

/** Eşleşmelerim (b0 / b5 · Eşleşmelerim): Aktif / Geçmiş, MatchCard listesi. */
export function MatchesScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isExpert = user?.role === 'expert'
  const [tab, setTab] = useState<MatchTab>('active')
  const query = useMatchesQuery([...MATCH_TAB_STATUSES[tab]])
  const { data, isLoading, isError, refetch } = query
  const { isRefreshing, onRefresh } = useRefresh(query)
  const matches = data?.data ?? []
  const activeCount = data?.meta.activeCount ?? 0
  const pastCount = data?.meta.pastCount ?? 0
  const viewerInitials = getInitials(user) || '·'

  return (
    <Screen
      testID="screen-matches"
      contentClassName="gap-4"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <EnterUp>
        <Text accessibilityRole="header" className="font-display text-h2 text-fg">
          Eşleşmelerim
        </Text>
      </EnterUp>
      <EnterUp delay={60}>
        <SegmentedControl
          size="lg"
          accessibilityLabel="Eşleşme sekmeleri"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'active', label: `Aktif · ${activeCount}` },
            { value: 'past', label: `Geçmiş · ${pastCount}` },
          ]}
        />
      </EnterUp>

      {isLoading ? (
        <View className="gap-2.5" accessibilityLabel="Yükleniyor">
          <Skeleton height={150} borderRadius="2xl" />
          <Skeleton height={150} borderRadius="2xl" delay={150} />
        </View>
      ) : isError ? (
        <ErrorBanner
          title="Eşleşmeler yüklenemedi"
          description="Bağlantını kontrol edip tekrar dene."
          onRetry={() => void refetch()}
        />
      ) : matches.length === 0 ? (
        <EnterUp className="items-center gap-3.5 px-5 py-10">
          <MeetingCircles />
          <Text className="text-center font-body-bold text-lg text-fg">
            {tab === 'active' ? 'Aktif eşleşmen yok' : 'Geçmiş eşleşmen yok'}
          </Text>
          <Text className="max-w-[300px] text-center text-body-sm text-fg-muted">
            {isExpert
              ? 'Fırsatlar’dan teklif ver; danışan seni seçtiğinde burada görünür.'
              : 'İlanına teklif veren bir uzmanla anlaştığında burada görünür.'}
          </Text>
        </EnterUp>
      ) : (
        matches.map((m, i) => (
          <EnterUp key={m.id} index={i + 2}>
            <MatchCard
              match={m}
              viewerRole={isExpert ? 'expert' : 'client'}
              viewerInitials={viewerInitials}
              onPress={() => router.push(`/match/${m.id}` as never)}
            />
          </EnterUp>
        ))
      )}
    </Screen>
  )
}
