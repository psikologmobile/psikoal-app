import { useState } from 'react'

import { FlatList, ScrollView, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'

import type { Listing } from '@/domains/listing'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Button } from '@/core/components/atoms/Button'
import { CountBadge } from '@/core/components/atoms/CountBadge'
import { FilterChip } from '@/core/components/atoms/FilterChip'
import { Icon } from '@/core/components/atoms/Icon'
import { IconButton } from '@/core/components/atoms/IconButton'
import { NavIcon } from '@/core/components/atoms/NavIcon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { StatTile } from '@/core/components/molecules/StatTile'
import { WebPageHeader } from '@/core/components/molecules/WebPageHeader'
import { Screen, WebColumns, WebGrid } from '@/core/components/templates'
import { useBreakpoint, useRefresh } from '@/core/hooks'
import { Bell, CountRoll, EnterUp, PressableScale, Radar, Spin } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { useAuthStore } from '@/domains/auth'
import {
  ProfileRejectedNotice,
  useExpertApprovalGate,
  useExpertProfileQuery,
} from '@/domains/expert'
import {
  ExpertListingCard,
  OpportunityFilterFields,
  OpportunityFilterSheet,
  expertListingAction,
  useOpportunityFeed,
} from '@/domains/listing'
import { useMatchesQuery } from '@/domains/match'
import { useUnreadNotificationCount } from '@/domains/notification'
import { useExpertOffersQuery } from '@/domains/offer'
import { TopupNotice, useWalletForegroundRefresh, useWalletQuery } from '@/domains/wallet'

const ZERO_BALANCE_MESSAGE =
  'Teklif göndermek için bakiyen yetersiz. Bakiye yüklemek için web sitemizi ziyaret edebilirsin.'

type StatCellProps = {
  label: string
  value: string
  accent?: boolean
  roll?: boolean
  className?: string
}

function StatCell({ label, value, accent = false, roll = false, className }: StatCellProps) {
  const valueClass = `font-display text-number ${accent ? 'text-primary-text' : 'text-fg'}`
  return (
    <View className={`flex-1 gap-0.5 px-4 py-3.5 ${className ?? ''}`}>
      <Text className="font-body-semibold text-badge text-fg-muted">{label}</Text>
      {roll ? (
        <CountRoll value={value} delay={300} offset={10} className={valueClass} />
      ) : (
        <Text className={valueClass}>{value}</Text>
      )}
    </View>
  )
}

/**
 * Uzman ana sekmesi "Fırsatlar" (tasarım: b4_Uzman_Fırsatlar). Durumlar: normal ·
 * onayBekliyor · reddedildi · bakiyeSifir · boş (radar) · yükleniyor · hata.
 */
export function ExpertHomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const colors = useThemeColors()
  const user = useAuthStore((s) => s.user)
  const unreadCount = useUnreadNotificationCount()
  const { isWebLayout, isWide } = useBreakpoint()

  const { canAct, isPendingApproval, isRejected, rejectionReason } = useExpertApprovalGate()
  const expertQuery = useExpertProfileQuery(user?.id ?? '')
  const walletQuery = useWalletQuery()
  const offersQuery = useExpertOffersQuery()
  const matchesQuery = useMatchesQuery()
  // Bakiye web sitesinden yüklenir: uygulama öne gelince ve yenilemede tazelenir.
  const { invalidateWallet } = useWalletForegroundRefresh()

  const feed = useOpportunityFeed({
    city: user?.city,
    specializations: expertQuery.data?.specializations,
  })
  const listingsQuery = feed.query
  const listings = listingsQuery.data?.data ?? []
  const total = listingsQuery.data?.meta.total ?? listings.length

  const [filterVisible, setFilterVisible] = useState(false)
  const { isRefreshing, onRefresh } = useRefresh(listingsQuery, offersQuery, matchesQuery, {
    refetch: invalidateWallet,
  })

  const wallet = walletQuery.data
  const isBalanceEmpty =
    wallet !== undefined && wallet.balanceKurus === 0 && wallet.freeOfferRights === 0
  const isFiltered = feed.activeFilterCount > 0
  const pendingCount = offersQuery.data?.meta.pendingCount ?? 0
  const activeMatchCount = matchesQuery.data?.meta.activeCount ?? 0

  const statusNotices = (
    <>
      {isPendingApproval ? (
        <EnterUp index={2}>
          <View className="flex-row items-center gap-3 rounded-xl bg-accent-soft px-4 py-3.5">
            <Spin duration={1000}>
              <View className="h-[26px] w-[26px] rounded-full border-[3px] border-accent-line border-t-primary" />
            </Spin>
            <Text className="flex-1 text-body-sm text-accent-soft-fg">
              <Text className="font-body-bold text-body-sm text-accent-soft-fg">
                Profilin incelemede.
              </Text>{' '}
              İlanları görebilirsin; onaylanınca teklif gönderebileceksin.
            </Text>
          </View>
        </EnterUp>
      ) : null}

      {isRejected ? (
        <EnterUp index={2}>
          <ProfileRejectedNotice
            reason={rejectionReason}
            onUpdate={() => router.push('/profile/professional?tab=belgeler')}
          />
        </EnterUp>
      ) : null}

      {canAct && isBalanceEmpty ? (
        <EnterUp index={2}>
          <TopupNotice
            tone="danger"
            message={ZERO_BALANCE_MESSAGE}
            webMessage="Teklif göndermek için bakiyen yetersiz."
            testID="opportunities-zero-balance"
          />
        </EnterUp>
      ) : null}
    </>
  )

  const chipRow = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
      {feed.chips.map((chip) => (
        <FilterChip
          key={chip.key}
          label={chip.label}
          selected={chip.selected}
          onPress={chip.onPress}
        />
      ))}
      <FilterChip
        label="Süzgeç"
        selected={isFiltered && !feed.chips.some((c) => c.selected)}
        count={isFiltered ? feed.activeFilterCount : undefined}
        onPress={() => setFilterVisible(true)}
        testID="opportunities-filter"
      />
    </ScrollView>
  )

  const header = (
    <View className="gap-3.5 pb-3.5">
      <EnterUp className="flex-row items-center justify-between">
        <View>
          <Text className="text-body-sm text-fg-muted">
            {user?.firstName ? `Merhaba, ${user.firstName}` : 'Merhaba'}
          </Text>
          <Text accessibilityRole="header" variant="h2">
            Fırsatlar
          </Text>
        </View>
        <IconButton
          size="lg"
          accessibilityLabel={
            unreadCount > 0 ? `Bildirimler, ${unreadCount} okunmamış` : 'Bildirimler'
          }
          onPress={() => router.push('/notifications')}
          badge={unreadCount > 0 ? <CountBadge count={unreadCount} popDelay={1000} ring /> : null}
        >
          <Bell>
            <NavIcon name="notifications" color={colors.text} size={22} />
          </Bell>
        </IconButton>
      </EnterUp>

      <EnterUp index={1}>
        <View className="overflow-hidden rounded-2xl border border-border bg-surface">
          <PressableScale
            onPress={() => router.push('/wallet')}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel={`Bakiyem: ${wallet?.balanceLabel ?? '—'}, ${wallet?.freeOfferRights ?? 0} ücretsiz hak`}
            className="flex-row border-b border-border"
          >
            <StatCell
              label="Bakiye"
              value={wallet?.balanceLabel ?? '—'}
              roll={wallet !== undefined}
              className="border-r border-border"
            />
            <StatCell label="Ücretsiz hak" value={String(wallet?.freeOfferRights ?? 0)} accent />
          </PressableScale>
          <View className="flex-row">
            <PressableScale
              onPress={() => router.push('/(tabs)/offers')}
              scaleTo={0.98}
              accessibilityRole="button"
              accessibilityLabel={`Bekleyen ${pendingCount} teklif`}
              wrapperClassName="flex-1"
              className="border-r border-border"
            >
              <StatCell label="Bekleyen" value={`${pendingCount} teklif`} />
            </PressableScale>
            <PressableScale
              onPress={() => router.push('/(tabs)/matches')}
              scaleTo={0.98}
              accessibilityRole="button"
              accessibilityLabel={`Aktif eşleşme ${activeMatchCount}`}
              wrapperClassName="flex-1"
            >
              <StatCell label="Aktif eşleşme" value={String(activeMatchCount)} />
            </PressableScale>
          </View>
        </View>
      </EnterUp>

      {statusNotices}

      <EnterUp index={2}>{chipRow}</EnterUp>

      <View className="flex-row items-center justify-between">
        <Text className="text-body-sm text-fg-muted">
          {listingsQuery.isLoading ? 'İlanlar yükleniyor' : `${total} açık ilan`}
        </Text>
        <PressableScale
          onPress={feed.cycleSort}
          accessibilityRole="button"
          accessibilityLabel={`Sıralama: ${feed.sortLabel}. Değiştirmek için dokun`}
          className="h-11 flex-row items-center gap-1.5 px-1"
        >
          <Icon name="ArrowDownUp" size={16} color={colors.primaryText} strokeWidth={2.4} />
          <Text className="font-body-bold text-body-sm text-primary-text">{feed.sortLabel}</Text>
        </PressableScale>
      </View>
    </View>
  )

  const listEmpty = listingsQuery.isLoading ? (
    <View className="gap-3" testID="opportunities-loading">
      <Skeleton variant="rect" height={230} borderRadius="3xl" />
      <Skeleton variant="rect" height={230} borderRadius="3xl" delay={150} />
    </View>
  ) : listingsQuery.isError ? (
    <ErrorBanner
      title="İlanlar yüklenemedi"
      description="Bağlantını kontrol edip tekrar dene."
      onRetry={() => void listingsQuery.refetch()}
    />
  ) : (
    <EmptyState
      illustration={<Radar />}
      title={isFiltered ? 'Bu süzgeçte ilan yok' : 'Şu an açık ilan yok'}
      description={
        isFiltered
          ? 'Süzgeçleri gevşetmeyi dene.'
          : 'Yeni ilanlar geldiğinde sana bildirim göndereceğiz.'
      }
      ctaLabel={isFiltered ? 'Süzgeçleri temizle' : undefined}
      onCta={isFiltered ? feed.clearFilters : undefined}
    />
  )

  const renderCard = (item: Listing, index: number) => (
    <ExpertListingCard
      listing={item}
      index={index + 3}
      action={expertListingAction(item, { canAct, isBalanceEmpty })}
      onOpen={() => router.push(`/listing/${item.id}`)}
      onOffer={() => router.push(`/offer/new?listingId=${item.id}`)}
      onViewOffer={() =>
        router.push(item.viewerOfferId ? `/offer/${item.viewerOfferId}` : `/listing/${item.id}`)
      }
    />
  )

  const filterSheet = (
    <OpportunityFilterSheet
      visible={filterVisible}
      value={feed.filters}
      onApply={(filters) => {
        feed.applyFilters(filters)
        setFilterVisible(false)
      }}
      onClose={() => setFilterVisible(false)}
    />
  )

  if (isWebLayout) {
    const hasCards = !listingsQuery.isLoading && !listingsQuery.isError && listings.length > 0
    return (
      <Screen
        testID="screen-opportunities"
        refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentClassName="gap-[22px]"
      >
        <WebPageHeader
          greeting={user?.firstName ? `Merhaba, ${user.firstName}` : 'Merhaba'}
          title="Fırsatlar"
          right={
            <Button
              label={`Sırala: ${feed.sortLabel}`}
              variant="outline"
              icon="ArrowDownUp"
              onPress={feed.cycleSort}
              testID="opportunities-sort"
            />
          }
        />
        <EnterUp index={1}>
          <WebGrid columns={isWide ? 4 : 2} gapClassName="gap-3">
            <StatTile label="Bakiye" value={wallet?.balanceLabel ?? '—'} animate={false} />
            <StatTile
              label="Ücretsiz hak"
              value={String(wallet?.freeOfferRights ?? 0)}
              tone="accent"
              animate={false}
            />
            <StatTile label="Bekleyen teklif" value={String(pendingCount)} animate={false} />
            <StatTile label="Aktif eşleşme" value={String(activeMatchCount)} animate={false} />
          </WebGrid>
        </EnterUp>
        {statusNotices}
        <WebColumns
          asidePosition="left"
          asideWidth={260}
          hideAsideWhenStacked
          testID="opportunities-columns"
          aside={
            <EnterUp index={2}>
              <View
                accessibilityLabel="Süzgeçler"
                className="gap-4 rounded-2xl border border-border p-4.5"
              >
                <OpportunityFilterFields
                  panel
                  value={feed.filters}
                  onChange={(update) => feed.applyFilters(update(feed.filters))}
                />
              </View>
            </EnterUp>
          }
        >
          {isWide ? null : chipRow}
          <Text className="text-body-sm text-fg-muted">
            {listingsQuery.isLoading ? 'İlanlar yükleniyor' : `${total} açık ilan`}
          </Text>
          {hasCards ? (
            <WebGrid columns={2}>{listings.map((item, index) => renderCard(item, index))}</WebGrid>
          ) : (
            listEmpty
          )}
        </WebColumns>
        {filterSheet}
      </Screen>
    )
  }

  return (
    <View className="flex-1 bg-bg" testID="screen-opportunities">
      <FlatList
        data={listingsQuery.isLoading || listingsQuery.isError ? [] : listings}
        keyExtractor={(item) => item.id}
        // REASON: üst boşluk cihazın güvenli alanından hesaplanır
        contentContainerStyle={{ paddingTop: insets.top + 12 }}
        contentContainerClassName="px-5 pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={header}
        ListEmptyComponent={listEmpty}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item, index }) => renderCard(item, index)}
      />

      {filterSheet}
    </View>
  )
}
