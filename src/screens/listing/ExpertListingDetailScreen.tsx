import { View } from 'react-native'

import { useLocalSearchParams, useRouter } from 'expo-router'

import { ExpertListingDetailWeb } from './ExpertListingDetailWeb'

import type { Listing } from '@/domains/listing'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { ContactCard } from '@/core/components/organisms/ContactCard'
import { Screen } from '@/core/components/templates'
import { useBreakpoint, useRefresh } from '@/core/hooks'
import { EnterUp, Float, Glow, Pop, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { formatDate } from '@/core/utils/formatDate'
import { RESULT_LEVEL_CONFIG } from '@/domains/assessment'
import { ProfileRejectedNotice, useExpertApprovalGate } from '@/domains/expert'
import {
  InvitedBadge,
  SESSION_MODE_LABELS,
  clientInitial,
  resolveExpertListingDetail,
  useListingDetailQuery,
} from '@/domains/listing'
import { useOfferQuoteQuery } from '@/domains/offer'
import { TOPUP_WEB_PATH } from '@/domains/wallet'
import { isApiErrorCode } from '@/lib/api'

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-0.5 rounded-lg bg-surface p-3">
      <Text className="text-badge text-fg-muted">{label}</Text>
      <Text numberOfLines={2} className="font-body-bold text-body-sm">
        {value}
      </Text>
    </View>
  )
}

function memberSince(listing: Listing): string {
  const since = listing.client?.createdAt
  const joined = since
    ? `${formatDate(since, 'long').split(' ').slice(1).join(' ')}'dan beri üye · `
    : ''
  return `${joined}${listing.createdAtRelative}`
}

function OutlineAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      wrapperClassName="flex-1"
      className="h-btn-md items-center justify-center rounded-lg border border-border-strong"
    >
      <Text className="font-body-semibold text-body">{label}</Text>
    </PressableScale>
  )
}

/**
 * İlan detayı — uzman görünümü (tasarım: b4_İlan_detayı_uzman). Durumlar:
 * teklifVerilebilir · teklifVerdin (iletişim açık) · başkasıylaEşleşti · kapandı ·
 * onayBekliyor · bakiyeYetersiz. Alt çubukta YALNIZ o anki ücret (düşüş göstergesi yok).
 */
export interface ExpertListingDetailScreenProps {
  /** Route'tan gelir; verilmezse URL parametresi okunur. */
  listingId?: string
}

export function ExpertListingDetailScreen({ listingId }: ExpertListingDetailScreenProps = {}) {
  const params = useLocalSearchParams<{ id: string }>()
  const id = listingId ?? params.id ?? ''
  const router = useRouter()
  const colors = useThemeColors()

  const listingQuery = useListingDetailQuery(id)
  const listing = listingQuery.data
  const { isPendingApproval, isRejected, canAct, rejectionReason } = useExpertApprovalGate()
  const { isWebLayout, width } = useBreakpoint()

  const wantsQuote = Boolean(
    listing && !listing.viewerHasOffered && listing.status === 'OPEN' && canAct
  )
  const quoteQuery = useOfferQuoteQuery(wantsQuote ? id : undefined)
  const { isRefreshing, onRefresh } = useRefresh(listingQuery, quoteQuery)

  if (listingQuery.isLoading) {
    return (
      <Screen testID="screen-expert-listing">
        <ScreenHeader title="İlan" />
        <View className="flex-row items-center gap-2.5">
          <Skeleton variant="circle" height={40} />
          <Skeleton variant="line" width="40%" delay={100} />
        </View>
        <Skeleton variant="line" width="85%" height={26} delay={150} />
        <Skeleton variant="rect" height={90} delay={250} />
        <View className="flex-row gap-2">
          <Skeleton variant="rect" height={60} width="32%" delay={300} />
          <Skeleton variant="rect" height={60} width="32%" delay={350} />
          <Skeleton variant="rect" height={60} width="32%" delay={400} />
        </View>
      </Screen>
    )
  }

  if (!listing) {
    const notFound = isApiErrorCode(listingQuery.error, 'LISTING_NOT_FOUND')
    return (
      <Screen testID="screen-expert-listing">
        <ScreenHeader title="İlan" />
        {notFound ? (
          <EmptyState
            icon="SearchX"
            title="İlan bulunamadı"
            description="İlan kaldırılmış ya da artık görüntülenemiyor olabilir."
            ctaLabel="Fırsatlara dön"
            onCta={() => router.replace('/')}
          />
        ) : (
          <ErrorBanner
            title="İlan yüklenemedi"
            description="Bağlantını kontrol edip tekrar dene."
            onRetry={() => void listingQuery.refetch()}
          />
        )}
      </Screen>
    )
  }

  const view = resolveExpertListingDetail({
    listing,
    isPendingApproval,
    isRejected,
    sufficient: quoteQuery.data?.sufficient,
  })
  const contact = listing.clientContact
  const level = listing.assessmentResult
    ? RESULT_LEVEL_CONFIG[listing.assessmentResult.level].label
    : null
  const balanceLabel = quoteQuery.data?.balanceLabel

  const goUpdateDocuments = () => router.push('/profile/professional?tab=belgeler')

  if (isWebLayout) {
    const quote = quoteQuery.data
    return (
      <Screen
        testID="screen-expert-listing"
        refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentClassName="gap-[22px]"
      >
        <ExpertListingDetailWeb
          listing={listing}
          view={view}
          clientName={contact?.fullName ?? listing.clientDisplayName ?? 'Danışan'}
          memberSince={memberSince(listing)}
          levelLabel={level}
          balanceLine={
            quote
              ? `Bakiyen ${quote.balanceLabel}${quote.freeOfferRights > 0 ? ` · ${quote.freeOfferRights} ücretsiz hak` : ''}`
              : null
          }
          insufficient={quote?.sufficient === false}
          isRejected={isRejected}
          rejectionReason={rejectionReason}
          wideInfo={width > 860}
          onBack={() => router.back()}
          onSendOffer={() => router.push(`/offer/new?listingId=${listing.id}`)}
          // REASON: /bakiye web yükleme sayfası; typed routes onu tanımıyor.
          onTopup={() => router.push(TOPUP_WEB_PATH as never)}
          onViewOffer={() => router.push(`/offer/${listing.viewerOfferId}`)}
          onClaim={() => router.push(`/claim/${listing.id}`)}
          onUpdateDocuments={goUpdateDocuments}
        />
      </Screen>
    )
  }

  const feeBar = view.showFeeBar ? (
    <EnterUp delay={400}>
      <View className="flex-row items-center gap-3.5" testID="listing-fee-bar">
        <View className="flex-1 gap-0.5">
          <Text className="text-badge text-fg-muted">
            {balanceLabel ? `Teklif ücreti · bakiye ${balanceLabel}` : 'Teklif ücreti'}
          </Text>
          <Text className="font-display text-[26px] leading-[30px]">
            {listing.offerFeeLabel ?? '—'}
          </Text>
        </View>
        {view.blockLabel ? (
          <View
            accessibilityRole="alert"
            className="h-btn-lg max-w-[170px] justify-center rounded-xl border border-danger bg-danger-soft px-4"
          >
            <Text className="text-center font-body-bold text-body-sm text-danger-soft-fg">
              {view.blockLabel}
            </Text>
          </View>
        ) : (
          <Glow>
            <PressableScale
              onPress={() => router.push(`/offer/new?listingId=${listing.id}`)}
              haptics="medium"
              accessibilityRole="button"
              accessibilityLabel={`Teklif gönder, ücret ${listing.offerFeeLabel ?? ''}`}
              testID="listing-send-offer"
              className="h-btn-lg justify-center rounded-xl bg-primary px-6"
            >
              <Text className="font-body-heavy text-base text-primary-fg">Teklif gönder</Text>
            </PressableScale>
          </Glow>
        )}
      </View>
    </EnterUp>
  ) : undefined

  return (
    <Screen
      testID="screen-expert-listing"
      footer={feeBar}
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <EnterUp>
        <ScreenHeader
          title="İlan"
          right={
            listing.invitedByViewer ? <InvitedBadge label="Davet edildin" delay={400} /> : null
          }
        />
      </EnterUp>

      <EnterUp index={1} className="flex-row items-center gap-2.5">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
          <Text className="font-body-heavy text-body text-accent-soft-fg">
            {clientInitial(listing)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-body-bold text-body">
            {contact?.fullName ?? listing.clientDisplayName ?? 'Danışan'}
          </Text>
          <Text className="text-badge text-fg-muted">{memberSince(listing)}</Text>
        </View>
      </EnterUp>

      <EnterUp index={1}>
        <Text accessibilityRole="header" className="font-display text-[26px] leading-[30px]">
          {listing.title}
        </Text>
      </EnterUp>
      {listing.description ? (
        <EnterUp index={2}>
          <Text className="text-body leading-[23px] text-fg-muted">{listing.description}</Text>
        </EnterUp>
      ) : null}

      <EnterUp index={2} className="flex-row gap-2">
        <InfoCell label="Alan" value={listing.specialization.join(', ') || '—'} />
        <InfoCell
          label="Görüşme"
          value={`${SESSION_MODE_LABELS[listing.preferredSessionType]}${listing.city ? ` · ${listing.city}` : ''}`}
        />
        <InfoCell label="Bütçe" value={listing.budgetLabel} />
      </EnterUp>

      {listing.assessmentResult ? (
        <EnterUp index={3}>
          <View className="gap-1.5 rounded-xl border border-border px-4 py-3.5">
            <View className="flex-row items-center justify-between gap-2">
              <Text className="flex-1 font-body-bold text-body">
                {listing.assessmentResult.assessmentTitle}
              </Text>
              <View className="rounded-full bg-accent-soft px-2.5 py-1">
                <Text className="font-body-heavy text-badge text-accent-soft-fg">
                  {level} · {listing.assessmentResult.score}
                </Text>
              </View>
            </View>
            <Text className="text-label text-fg-muted">{listing.assessmentResult.summary}</Text>
          </View>
        </EnterUp>
      ) : null}

      <EnterUp index={3}>
        <Text className="font-body-semibold text-body-sm text-fg-muted">
          {listing.offerCount > 0
            ? `Bu ilana ${listing.offerCount} uzman teklif verdi`
            : 'Bu ilana henüz teklif verilmedi'}
        </Text>
      </EnterUp>

      {isRejected ? (
        <EnterUp index={4}>
          <ProfileRejectedNotice reason={rejectionReason} onUpdate={goUpdateDocuments} />
        </EnterUp>
      ) : null}

      {!view.offered && !view.closedText ? (
        <EnterUp index={4}>
          <View className="flex-row items-center gap-3 rounded-card bg-accent-soft p-4">
            <Float distance={5} duration={1600}>
              <View className="h-11 w-11 items-center justify-center rounded-md bg-bg">
                <Icon name="Lock" size={22} color={colors.primaryText} />
              </View>
            </Float>
            <Text className="flex-1 text-body-sm text-accent-soft-fg">
              Teklif gönderince danışanın iletişim bilgileri sana açılır.
            </Text>
          </View>
        </EnterUp>
      ) : null}

      {view.offered && contact ? (
        <EnterUp index={4}>
          <View testID="listing-contact">
            <ContactCard
              phone={contact.phone ?? undefined}
              email={contact.email}
              header={
                <View className="flex-row items-center gap-2.5">
                  <Pop>
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
                      <Icon name="LockOpen" size={16} color={colors.onPrimary} strokeWidth={2.4} />
                    </View>
                  </Pop>
                  <Text className="font-body-bold text-body text-accent-soft-fg">
                    İletişim bilgileri açık
                  </Text>
                </View>
              }
            />
          </View>
        </EnterUp>
      ) : null}

      {view.offered ? (
        <EnterUp index={5} className="flex-row gap-2">
          {listing.viewerOfferId ? (
            <OutlineAction
              label="Teklifimi gör"
              onPress={() => router.push(`/offer/${listing.viewerOfferId}`)}
            />
          ) : null}
          {view.canClaim ? (
            <OutlineAction
              label="Danışanla anlaştım"
              onPress={() => router.push(`/claim/${listing.id}`)}
            />
          ) : null}
        </EnterUp>
      ) : null}

      {view.closedText ? (
        <EnterUp index={4}>
          <View className="rounded-card border border-dashed border-border-strong p-4">
            <Text className="text-body-sm text-fg-muted">{view.closedText}</Text>
          </View>
        </EnterUp>
      ) : null}
    </Screen>
  )
}
