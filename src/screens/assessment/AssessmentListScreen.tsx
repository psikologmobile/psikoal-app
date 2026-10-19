import { View } from 'react-native'

import { useRouter } from 'expo-router'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { Screen } from '@/core/components/templates'
import { useRefresh } from '@/core/hooks'
import { EnterUp, Float, Orbit } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import {
  ResultCard,
  TestCard,
  useMyAssessmentResultsQuery,
  usePlayableAssessments,
} from '@/domains/assessment'

/** Testler: sonuçlarım + tüm testler (tasarım: b0_Testler). */
export function AssessmentListScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const testsQuery = usePlayableAssessments()
  const resultsQuery = useMyAssessmentResultsQuery()
  const { isRefreshing, onRefresh } = useRefresh(testsQuery, resultsQuery)

  const results = resultsQuery.data?.data ?? []
  const tests = testsQuery.data

  return (
    <Screen
      testID="screen-assessment-list"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      contentClassName="gap-4"
    >
      <EnterUp>
        <ScreenHeader title="Testler" onBack={() => router.back()} />
      </EnterUp>

      <EnterUp index={1} className="gap-1.5 overflow-hidden rounded-3xl bg-accent-soft p-5">
        <View className="absolute -right-[30px] -top-[30px]" pointerEvents="none">
          <Orbit duration={14000}>
            <View className="h-[120px] w-[120px] rounded-full border border-dashed border-accent-line" />
          </Orbit>
        </View>
        <Text className="font-display-bold text-[22px] leading-7 text-accent-soft-fg">
          Kendini tanımanın kısa yolu
        </Text>
        <Text className="text-body-sm text-accent-soft-fg">
          Tüm testler ücretsiz. Sonuçlar tanı koymaz, bilgilendirme amaçlıdır.
        </Text>
      </EnterUp>

      <EnterUp index={2}>
        <Text variant="title" accessibilityRole="header" className="mt-1">
          Sonuçlarım
        </Text>
      </EnterUp>
      {resultsQuery.isLoading ? (
        <View accessibilityLabel="Yükleniyor" className="gap-2.5">
          <Skeleton height={88} borderRadius="xl" />
          <Skeleton height={88} borderRadius="xl" delay={150} />
        </View>
      ) : resultsQuery.isError ? (
        <ErrorBanner
          title="Sonuçların yüklenemedi"
          description="Bağlantını kontrol edip tekrar dene."
          onRetry={() => void resultsQuery.refetch()}
        />
      ) : results.length === 0 ? (
        <EnterUp index={3}>
          <View className="flex-row items-center gap-3.5 rounded-card border border-dashed border-border-strong p-[22px]">
            <Float>
              <View className="h-13 w-13 items-center justify-center rounded-lg bg-accent-soft">
                <Icon name="ClipboardList" size={24} color={colors.onAccentSoft} />
              </View>
            </Float>
            <Text className="flex-1 text-body-sm text-fg-muted">
              Henüz bir test çözmedin. Aşağıdan biriyle başlayabilirsin.
            </Text>
          </View>
        </EnterUp>
      ) : (
        results.map((result, i) => (
          <EnterUp key={result.id} index={i + 3}>
            <ResultCard
              result={result}
              onPress={() =>
                router.push({ pathname: '/assessment/result', params: { resultId: result.id } })
              }
            />
          </EnterUp>
        ))
      )}

      <EnterUp index={4}>
        <Text variant="title" accessibilityRole="header" className="mt-1.5">
          Tüm testler
        </Text>
      </EnterUp>
      {testsQuery.isLoading ? (
        <View className="gap-2.5">
          <Skeleton height={76} borderRadius="xl" />
          <Skeleton height={76} borderRadius="xl" delay={150} />
        </View>
      ) : tests && tests.length > 0 ? (
        tests.map((test, i) => (
          <EnterUp key={test.id} index={Math.min(6, i + 4)}>
            <TestCard test={test} onPress={() => router.push('/assessment')} />
          </EnterUp>
        ))
      ) : (
        <Text className="text-body-sm text-fg-muted">Şu an çözülebilecek bir test yok.</Text>
      )}
    </Screen>
  )
}
