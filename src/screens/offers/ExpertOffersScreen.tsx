import { useState } from 'react'

import { FlatList, ScrollView, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'

import type { ExpertOfferFilter } from '@/domains/offer'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { FilterChip } from '@/core/components/atoms/FilterChip'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { useRefresh } from '@/core/hooks'
import { CountRoll, EnterUp } from '@/core/motion'
import {
  EXPERT_OFFER_FILTERS,
  ExpertOfferCard,
  matchesOfferFilter,
  useExpertOffersQuery,
} from '@/domains/offer'

function Stat({
  value,
  label,
  accent = false,
}: {
  value: string
  label: string
  accent?: boolean
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className={`flex-1 gap-0.5 rounded-lg p-3 ${accent ? 'bg-accent-soft' : 'bg-surface'}`}
    >
      <CountRoll
        value={value}
        delay={200}
        offset={12}
        className={`font-display text-2xl ${accent ? 'text-accent-soft-fg' : 'text-fg'}`}
      />
      <Text className={`text-badge ${accent ? 'text-accent-soft-fg' : 'text-fg-muted'}`}>
        {label}
      </Text>
    </View>
  )
}

/**
 * Uzman "Tekliflerim" sekmesi (tasarım: b4_Tekliflerim). Süzgeç backend
 * `statusLabel` gruplarıyla; durumlar dolu · boş · yükleniyor · hata.
 */
export function ExpertOffersScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState<ExpertOfferFilter>('Tümü')
  // Tek istek: bütün teklifler gelir, statusLabel'a göre ekranda süzülür
  // (REJECTED üç farklı kapanış nedenine bölünüyor, sunucu süzgeci bunu ayırmıyor).
  const offersQuery = useExpertOffersQuery()
  const { isRefreshing, onRefresh } = useRefresh(offersQuery)

  const all = offersQuery.data?.data ?? []
  const offers = all.filter((offer) => matchesOfferFilter(offer, filter))
  const pendingCount = offersQuery.data?.meta.pendingCount ?? 0
  const selectedCount = all.filter((offer) => offer.status === 'ACCEPTED').length
  const isFiltered = filter !== 'Tümü'

  const header = (
    <View className="gap-3.5 pb-3.5">
      <EnterUp>
        <Text accessibilityRole="header" variant="h2">
          Tekliflerim
        </Text>
      </EnterUp>
      <EnterUp index={1} className="flex-row gap-2">
        <Stat value={String(pendingCount)} label="Bekleyen" />
        <Stat value={String(selectedCount)} label="Seçildi" accent />
        <Stat value={String(offersQuery.data?.meta.total ?? 0)} label="Toplam teklif" />
      </EnterUp>
      <EnterUp index={2}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {EXPERT_OFFER_FILTERS.map((label) => (
            <FilterChip
              key={label}
              label={label}
              selected={filter === label}
              onPress={() => setFilter(label)}
            />
          ))}
        </ScrollView>
      </EnterUp>
    </View>
  )

  const empty = offersQuery.isLoading ? (
    <View className="gap-2.5" testID="offers-loading">
      {[0, 150, 300].map((delay) => (
        <Skeleton key={delay} variant="rect" height={130} borderRadius="2xl" delay={delay} />
      ))}
    </View>
  ) : offersQuery.isError ? (
    <ErrorBanner
      title="Teklifler yüklenemedi"
      onRetry={() => void offersQuery.refetch()}
      retryLabel="Tekrar dene"
    />
  ) : (
    <EmptyState
      icon="Send"
      title={isFiltered ? 'Bu durumda teklifin yok' : 'Henüz teklif vermedin'}
      description={
        isFiltered ? 'Başka bir süzgeç seçebilirsin.' : 'Fırsatlar’dan bir ilana teklif ver.'
      }
      ctaLabel={isFiltered ? undefined : 'Fırsatlara git'}
      onCta={isFiltered ? undefined : () => router.push('/')}
    />
  )

  return (
    <View className="flex-1 bg-bg" testID="screen-expert-offers">
      <FlatList
        data={offersQuery.isLoading || offersQuery.isError ? [] : offers}
        keyExtractor={(item) => item.id}
        // REASON: üst boşluk cihazın güvenli alanından hesaplanır
        contentContainerStyle={{ paddingTop: insets.top + 12 }}
        contentContainerClassName="px-5 pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        renderItem={({ item, index }) => (
          <ExpertOfferCard
            offer={item}
            index={Math.min(6, index + 3)}
            onPress={() =>
              router.push(
                item.status === 'ACCEPTED' && item.matchId
                  ? `/match/${item.matchId}`
                  : `/offer/${item.id}`
              )
            }
          />
        )}
      />
    </View>
  )
}
