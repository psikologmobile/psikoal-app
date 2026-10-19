import { useState } from 'react'

import { ScrollView, View } from 'react-native'

import { useRouter } from 'expo-router'

import type { Listing } from '@/domains/listing'
import type { Offer, OfferSort } from '@/domains/offer'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Avatar } from '@/core/components/atoms/Avatar'
import { Button } from '@/core/components/atoms/Button'
import { FilterChip } from '@/core/components/atoms/FilterChip'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { StatusPill } from '@/core/components/atoms/StatusPill'
import { TagChip } from '@/core/components/atoms/TagChip'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { BottomSheet } from '@/core/components/organisms/BottomSheet'
import { Screen } from '@/core/components/templates'
import { useRefresh } from '@/core/hooks'
import { EnterUp, FadeIn, Pop, PressableScale, Ring, Spin } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { RESULT_LEVEL_LABELS } from '@/domains/assessment'
import {
  CLIENT_LISTING_STATUS,
  listingBudgetLabel,
  listingDaysLeft,
  MatchConfirmSheet,
  CLIENT_SESSION_MODE_LABELS,
  useCloseListingMutation,
  useDismissClaimMutation,
  useListingDetailQuery,
  useMatchConfirm,
} from '@/domains/listing'
import { matchCelebrateRoute } from '@/domains/match'
import { usePushTokenRegistration } from '@/domains/notification'
import { OFFER_SORT_OPTIONS, OfferCard, sortOffers, useListingOffersQuery } from '@/domains/offer'
import { getErrorMessage } from '@/lib/api'

type ClientListingDetailScreenProps = {
  listingId: string
}

function metaRight(listing: Listing): string {
  switch (listing.status) {
    case 'OPEN': {
      const days = listingDaysLeft(listing.expiresAt)
      const count = `${listing.offerCount} teklif`
      return days === null ? count : `${days} gün kaldı · ${count}`
    }
    case 'EXPIRED':
    case 'CLOSED':
      return 'Kapandı'
    case 'MATCHED':
      return `${listing.offerCount} teklif`
    default:
      return listing.createdAtRelative
  }
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => part && !part.endsWith('.'))
    .slice(-2)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr-TR'))
    .join('')
}

/** "Henüz teklif yok" — `radar`: 3 halka sırayla yayılır (2,2 sn ∞). */
function NoOffers() {
  return (
    <View className="items-center gap-3.5 px-5 py-7">
      <View className="h-[120px] w-[120px] items-center justify-center" accessibilityElementsHidden>
        {[0, 700, 1400].map((delay) => (
          <View key={delay} className="absolute inset-0">
            <Ring size={120} delay={delay} duration={2200} from={0.3} to={1.6} />
          </View>
        ))}
        <View className="h-9 w-9 rounded-full bg-primary" />
      </View>
      <Text className="font-body-bold text-lg text-fg">Henüz teklif yok</Text>
      <Text variant="bodySm" color="muted" align="center" className="max-w-[290px]">
        İlanın uzmanlara ulaştı. İlk teklif geldiğinde sana bildirim göndereceğiz.
      </Text>
    </View>
  )
}

function DetailSkeleton() {
  return (
    <View accessibilityLabel="Yükleniyor" className="gap-3.5">
      <Skeleton height={170} borderRadius="3xl" />
      <Skeleton width={160} height={22} borderRadius="xs" delay={120} />
      <Skeleton height={190} borderRadius="2xl" delay={240} />
      <Skeleton height={190} borderRadius="2xl" delay={360} />
    </View>
  )
}

/** Danışan · İlan detayı (tasarım: b0_İlan_detayı_danışan). */
export function ClientListingDetailScreen({ listingId }: ClientListingDetailScreenProps) {
  const router = useRouter()
  const colors = useThemeColors()
  const [sort, setSort] = useState<OfferSort>('newest')
  const [showDescription, setShowDescription] = useState(false)
  const [closeSheet, setCloseSheet] = useState(false)

  const listingQuery = useListingDetailQuery(listingId)
  const offersQuery = useListingOffersQuery(listingId)
  const { isRefreshing, onRefresh } = useRefresh(listingQuery, offersQuery)
  const { mutate: dismissClaim, isPending: isDismissing } = useDismissClaimMutation()
  const closeMutation = useCloseListingMutation()

  const match = useMatchConfirm({
    listingId,
    onMatched: (matchId) => router.replace(matchCelebrateRoute(matchId)),
  })

  const listing = listingQuery.data
  const offers = sortOffers(offersQuery.data?.data ?? [], sort)
  // Bildirim izni ilk teklif geldiğinde istenir (CLAUDE.md · geliştirici notu 7).
  usePushTokenRegistration(offers.length > 0)

  const askFor = (offer: Offer) =>
    match.ask({
      offerId: offer.id,
      expertName: offer.expert?.name ?? 'Uzman',
      expertInitials: offer.expert?.initials ?? undefined,
    })

  const header = <ScreenHeader title="İlan detayı" onBack={() => router.back()} />

  if (listingQuery.isLoading) {
    return (
      <Screen testID="screen-listing-detail">
        {header}
        <DetailSkeleton />
      </Screen>
    )
  }

  if (listingQuery.isError || !listing) {
    return (
      <Screen testID="screen-listing-detail">
        {header}
        <EmptyState
          icon="FileX"
          title="İlan bulunamadı"
          description="İlan kaldırılmış ya da sana ait değil."
          ctaLabel="Geri dön"
          onCta={() => router.back()}
        />
      </Screen>
    )
  }

  const status = CLIENT_LISTING_STATUS[listing.status]
  const isOpen = listing.status === 'OPEN'
  const claims = listing.claims ?? []
  const claimedIds = new Set(claims.map((claim) => claim.expertId))
  const pendingOfferOf = (expertId: string) =>
    offersQuery.data?.data.find((o) => o.expertId === expertId && o.status === 'PENDING')
  const matchedOffer = offersQuery.data?.data.find((o) => o.status === 'ACCEPTED')
  const showOffers = listing.status !== 'PENDING_APPROVAL' && listing.status !== 'REJECTED_BY_ADMIN'

  return (
    <Screen
      testID="screen-listing-detail"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      contentClassName="gap-4"
    >
      <EnterUp>{header}</EnterUp>

      <EnterUp index={1} className="gap-3 rounded-3xl bg-surface p-4.5">
        <View className="flex-row items-center justify-between gap-2">
          <StatusPill label={status.label} variant={status.variant === 'live' ? 'live' : 'soft'} />
          <Text className="shrink text-label text-fg-muted">{metaRight(listing)}</Text>
        </View>
        <Text className="font-body-bold text-xl text-fg">{listing.title}</Text>
        <View className="flex-row flex-wrap gap-1.5">
          {listing.specialization.map((spec) => (
            <TagChip key={spec} label={spec} tone="bg" />
          ))}
          <TagChip label={CLIENT_SESSION_MODE_LABELS[listing.preferredSessionType]} tone="bg" />
          {listing.city ? <TagChip label={listing.city} tone="bg" /> : null}
          <TagChip label={listingBudgetLabel(listing)} tone="bg" />
          {listing.assessmentResult ? (
            <TagChip
              tone="accent"
              label={`${listing.assessmentResult.assessmentTitle} · ${RESULT_LEVEL_LABELS[listing.assessmentResult.level]}`}
            />
          ) : null}
        </View>
        {showDescription && listing.description ? (
          <FadeIn>
            <Text variant="bodySm" color="muted">
              {listing.description}
            </Text>
          </FadeIn>
        ) : null}
        {listing.description ? (
          <Button
            variant="link"
            label={showDescription ? 'Açıklamayı gizle' : 'Açıklamayı gör'}
            onPress={() => setShowDescription((v) => !v)}
            className="self-start px-0"
          />
        ) : null}
      </EnterUp>

      {listing.status === 'REJECTED_BY_ADMIN' ? (
        <EnterUp index={2}>
          <View
            accessibilityRole="alert"
            className="gap-1.5 rounded-card border border-danger bg-danger-soft p-4"
          >
            <Text className="font-body-bold text-body text-danger-soft-fg">Red gerekçesi</Text>
            <Text className="text-body-sm text-danger-soft-fg">
              {listing.rejectionReason ??
                'İlan açıklaması yetersiz. İhtiyacını biraz daha anlatıp yeniden gönderebilirsin.'}
            </Text>
            <View className="mt-1.5 self-start">
              <Button
                label="Yeniden düzenle"
                size="sm"
                onPress={() => router.push('/listing/new')}
              />
            </View>
          </View>
        </EnterUp>
      ) : null}

      {listing.status === 'PENDING_APPROVAL' ? (
        <EnterUp
          index={2}
          className="flex-row items-center gap-3.5 rounded-card bg-accent-soft p-5"
        >
          <Spin duration={3000}>
            <View className="h-9 w-9 rounded-full border-[3px] border-accent-line border-t-primary" />
          </Spin>
          <Text className="flex-1 text-body-sm text-accent-soft-fg">
            <Text className="font-body-bold">İlanın incelemede.</Text> Admin onayından sonra
            uzmanlar görecek; genelde birkaç saat sürer.
          </Text>
        </EnterUp>
      ) : null}

      {listing.status === 'EXPIRED' || listing.status === 'CLOSED' ? (
        <EnterUp index={2}>
          <Text className="rounded-card border border-dashed border-border-strong p-4 text-body-sm text-fg-muted">
            {listing.status === 'EXPIRED'
              ? 'İlanın 30 günü doldu ve kapandı. Gelen teklifleri hâlâ görebilirsin.'
              : 'İlanını kapattın. Gelen teklifleri hâlâ görebilirsin.'}
          </Text>
        </EnterUp>
      ) : null}

      {isOpen
        ? claims.map((claim) => {
            const offer = pendingOfferOf(claim.expertId)
            return (
              <EnterUp key={claim.expertId} index={2}>
                <View className="gap-3 rounded-card border border-primary p-4">
                  <Text className="text-body-sm text-fg">
                    <Text className="font-body-bold">{claim.expertName}</Text> seninle anlaştığını
                    bildirdi. Anlaştıysan ilanını eşleşti olarak işaretle.
                  </Text>
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Button
                        label="İşaretle"
                        size="sm"
                        fullWidth
                        isDisabled={!offer}
                        onPress={() => offer && askFor(offer)}
                      />
                    </View>
                    <View className="flex-1">
                      <Button
                        label="Anlaşmadım"
                        size="sm"
                        variant="outline"
                        fullWidth
                        isDisabled={isDismissing}
                        onPress={() => dismissClaim({ listingId, expertId: claim.expertId })}
                      />
                    </View>
                  </View>
                </View>
              </EnterUp>
            )
          })
        : null}

      {listing.status === 'MATCHED' && listing.matchedExpert ? (
        <EnterUp index={2}>
          <PressableScale
            onPress={() =>
              matchedOffer?.matchId ? router.push(`/match/${matchedOffer.matchId}`) : undefined
            }
            disabled={!matchedOffer?.matchId}
            accessibilityRole="button"
            accessibilityLabel={`${listing.matchedExpert.name} ile eşleştin`}
            className="flex-row items-center gap-3.5 rounded-2xl bg-accent p-4.5"
          >
            <Pop>
              <Avatar size="xl" tone="primary" initials={initialsOf(listing.matchedExpert.name)} />
            </Pop>
            <View className="flex-1 gap-0.5">
              <Text className="font-body-bold text-[17px] text-accent-fg">
                {listing.matchedExpert.name} ile eşleştin
              </Text>
              <Text className="text-label text-accent-muted">İlan yeni tekliflere kapandı</Text>
            </View>
            <Icon name="ChevronRight" size={20} color={colors.onAccent} />
          </PressableScale>
        </EnterUp>
      ) : null}

      {showOffers ? (
        offersQuery.isLoading ? (
          <View className="gap-3">
            <Skeleton height={190} borderRadius="2xl" />
            <Skeleton height={190} borderRadius="2xl" delay={150} />
          </View>
        ) : offersQuery.isError ? (
          <ErrorBanner
            title="Teklifler yüklenemedi"
            description="Bağlantını kontrol edip tekrar dene."
            retryLabel="Tekrar dene"
            onRetry={() => void offersQuery.refetch()}
          />
        ) : offers.length === 0 ? (
          isOpen ? (
            <EnterUp index={3}>
              <NoOffers />
            </EnterUp>
          ) : null
        ) : (
          <>
            <EnterUp index={3}>
              <Text variant="title" accessibilityRole="header">
                Teklifler ({offers.length})
              </Text>
            </EnterUp>
            <EnterUp index={3}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5"
                contentContainerClassName="gap-2 px-5"
              >
                {OFFER_SORT_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.value}
                    size="sm"
                    label={option.label}
                    selected={sort === option.value}
                    onPress={() => setSort(option.value)}
                  />
                ))}
              </ScrollView>
            </EnterUp>
            {offers.map((offer, i) => (
              <EnterUp key={offer.id} index={Math.min(7, i + 4)}>
                <OfferCard
                  offer={offer}
                  claimed={claimedIds.has(offer.expertId)}
                  showActions={isOpen && offer.status === 'PENDING'}
                  onProfile={() =>
                    router.push({
                      pathname: '/expert/[id]',
                      params: { id: offer.expertId, offerId: offer.id },
                    })
                  }
                  onDetail={() => router.push(`/offer/${offer.id}`)}
                  onAgree={() => askFor(offer)}
                />
              </EnterUp>
            ))}
            {isOpen ? (
              <Button variant="link" label="İlanı kapat" onPress={() => setCloseSheet(true)} />
            ) : null}
          </>
        )
      ) : null}

      <MatchConfirmSheet
        target={match.target}
        onCancel={match.cancel}
        onConfirm={match.confirm}
        isPending={match.isPending}
        errorMessage={match.errorMessage}
      />

      <BottomSheet
        visible={closeSheet}
        onClose={() => !closeMutation.isPending && setCloseSheet(false)}
        dismissable={!closeMutation.isPending}
        title="İlanı kapat"
        description="İlanın kapanacak ve yeni teklif gelmeyecek."
        actions={
          <View className="flex-row gap-2.5">
            <View className="flex-1">
              <Button
                label="Vazgeç"
                variant="outline"
                size="lg"
                fullWidth
                isDisabled={closeMutation.isPending}
                onPress={() => setCloseSheet(false)}
              />
            </View>
            <View className="flex-1">
              <Button
                label="Kapat"
                variant="danger"
                size="lg"
                fullWidth
                isLoading={closeMutation.isPending}
                loadingLabel="Kapatılıyor…"
                onPress={() =>
                  closeMutation.mutate(listingId, {
                    onSuccess: () => {
                      setCloseSheet(false)
                      router.back()
                    },
                  })
                }
              />
            </View>
          </View>
        }
      >
        {closeMutation.error ? (
          <ErrorBanner message={getErrorMessage(closeMutation.error)} />
        ) : null}
      </BottomSheet>
    </Screen>
  )
}
