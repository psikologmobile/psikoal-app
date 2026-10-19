import { useState } from 'react'

import { ScrollView, View } from 'react-native'

import { useRouter } from 'expo-router'

import type { ListingStatus } from '@/domains/listing'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { FilterChip } from '@/core/components/atoms/FilterChip'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { Screen } from '@/core/components/templates'
import { useRefresh } from '@/core/hooks'
import { EnterUp, Fill, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import {
  AdCard,
  LISTING_MAX_ACTIVE,
  useListingRulesQuery,
  useMyListingsQuery,
} from '@/domains/listing'

type Filter = ListingStatus | 'ALL'

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'OPEN', label: 'Yayında' },
  { value: 'PENDING_APPROVAL', label: 'Onay bekliyor' },
  { value: 'MATCHED', label: 'Eşleşti' },
  { value: 'CLOSED', label: 'Kapatıldı' },
  { value: 'EXPIRED', label: 'Süresi doldu' },
  { value: 'REJECTED_BY_ADMIN', label: 'Reddedildi' },
]

function QuotaBar({ activeCount, maxActive }: { activeCount: number; maxActive: number }) {
  return (
    <View className="flex-row items-center gap-3 rounded-xl bg-surface px-4 py-3.5">
      <View className="flex-1 gap-2">
        <Text className="font-body-semibold text-body-sm text-fg">
          {activeCount} / {maxActive} açık ilan
        </Text>
        <View
          className="flex-row gap-1"
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: maxActive, now: activeCount }}
        >
          {Array.from({ length: maxActive }, (_, i) => (
            <View key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-border-strong">
              {i < activeCount ? <Fill value={1} delay={i * 500} duration={500} /> : null}
            </View>
          ))}
        </View>
      </View>
      <Text className="max-w-[150px] text-label text-fg-muted">
        Aynı anda en çok {maxActive} açık ilanın olabilir.
      </Text>
    </View>
  )
}

/** Danışan · İlanlarım (tasarım: b0_İlanlarım). */
export function ClientListingsScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const [filter, setFilter] = useState<Filter>('ALL')

  const myListingsQuery = useMyListingsQuery(filter === 'ALL' ? undefined : filter)
  const rulesQuery = useListingRulesQuery()
  const { isRefreshing, onRefresh } = useRefresh(myListingsQuery)

  const listings = myListingsQuery.data?.data ?? []
  const activeCount = myListingsQuery.data?.meta.activeCount ?? 0
  const maxActive = rulesQuery.data?.maxActive ?? LISTING_MAX_ACTIVE
  const isFiltered = filter !== 'ALL'

  return (
    <Screen
      testID="screen-client-listings"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      contentClassName="gap-4"
    >
      <EnterUp className="flex-row items-center justify-between">
        <Text variant="h2" accessibilityRole="header">
          İlanlarım
        </Text>
        <PressableScale
          onPress={() => router.push('/listing/new')}
          haptics="medium"
          accessibilityRole="button"
          accessibilityLabel="Yeni ilan"
          className="h-12 w-12 items-center justify-center rounded-lg bg-primary"
        >
          <Icon name="Plus" size={22} color={colors.onPrimary} strokeWidth={2.5} />
        </PressableScale>
      </EnterUp>

      <EnterUp index={1}>
        <QuotaBar activeCount={activeCount} maxActive={maxActive} />
      </EnterUp>

      <EnterUp index={2}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-5"
          contentContainerClassName="gap-2 px-5"
        >
          {FILTERS.map((item) => (
            <FilterChip
              key={item.value}
              label={item.label}
              selected={filter === item.value}
              onPress={() => setFilter(item.value)}
              testID={`listing-filter-${item.value}`}
            />
          ))}
        </ScrollView>
      </EnterUp>

      {myListingsQuery.isLoading ? (
        <View accessibilityLabel="Yükleniyor" className="gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={150} borderRadius="2xl" delay={i * 150} />
          ))}
        </View>
      ) : myListingsQuery.isError ? (
        <ErrorBanner
          title="İlanların yüklenemedi"
          description="Bir sorun oluştu. Tekrar dener misin?"
          retryLabel="Tekrar dene"
          onRetry={() => void myListingsQuery.refetch()}
        />
      ) : listings.length === 0 ? (
        <EmptyState
          icon="FileText"
          title={isFiltered ? 'Bu durumda ilanın yok' : 'Henüz ilan açmadın'}
          description={
            isFiltered
              ? 'Başka bir süzgeç seçebilir ya da yeni bir ilan açabilirsin.'
              : 'İlan aç, uzmanlar sana teklif göndersin.'
          }
          ctaLabel="Yeni ilan aç"
          onCta={() => router.push('/listing/new')}
        />
      ) : (
        <View className="gap-3">
          {listings.map((listing, i) => (
            <EnterUp key={listing.id} index={Math.min(7, i + 3)}>
              <AdCard listing={listing} onPress={() => router.push(`/listing/${listing.id}`)} />
            </EnterUp>
          ))}
        </View>
      )}
    </Screen>
  )
}
