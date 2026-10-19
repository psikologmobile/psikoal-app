import { ScrollView, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Avatar } from '@/core/components/atoms/Avatar'
import { Chip } from '@/core/components/atoms/Chip'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { BackButton } from '@/core/components/molecules/BackButton'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ScreenTitle } from '@/core/components/molecules/ScreenTitle'
import { BottomActionBar } from '@/core/components/organisms/BottomActionBar'
import { useRefresh } from '@/core/hooks'
import { getFullName, getInitials } from '@/core/utils/personName'
import { useAuthStore } from '@/domains/auth'
import { useExpertApprovalGate } from '@/domains/expert'
import { useListingDetailQuery, ListingDetail } from '@/domains/listing'
import { useOfferDetailQuery, OFFER_STATUS_CONFIG } from '@/domains/offer'

type ExpertListingDetailScreenProps = {
  listingId: string
}

/**
 * Uzman · İlan detayı — GEÇİCİ: eski ekranın uzman dalı olduğu gibi taşındı (G2 rol
 * ayrımı). v2 tasarımı G3 grubunda yazılacak ve bu dosyanın yerini alacak.
 */
export function ExpertListingDetailScreen({ listingId }: ExpertListingDetailScreenProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const insets = useSafeAreaInsets()

  const listingQuery = useListingDetailQuery(listingId)
  const { data: listing, isLoading, isError } = listingQuery
  const { isRefreshing, onRefresh } = useRefresh(listingQuery)

  const hasAlreadySentOffer = listing?.viewerHasOffered ?? false
  const { data: myOffer } = useOfferDetailQuery(listing?.viewerOfferId ?? '')
  const { canAct: canSendOffer, isPendingApproval } = useExpertApprovalGate()

  const handleSendOffer = () => {
    router.push(`/offer/new?listingId=${listingId}` as never)
  }

  const bottomBarHeight = 56 + insets.bottom

  return (
    <View className="flex-1 bg-surface-base dark:bg-dark-bg">
      <BackButton />

      {isLoading && (
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 48 }}>
          <View className="gap-4 px-4">
            <View className="flex-row items-center gap-3">
              <Skeleton variant="circle" width={56} height={56} />
              <View className="flex-1 gap-2">
                <Skeleton variant="line" width="40%" height={16} />
                <Skeleton variant="line" width="25%" height={11} />
              </View>
            </View>
            <Skeleton variant="line" width="85%" height={18} />
            <Skeleton variant="line" width="60%" height={11} />
          </View>
        </ScrollView>
      )}

      {isError && (
        <EmptyState
          icon="AlertCircle"
          title="İlan bulunamadı"
          ctaLabel="Geri Dön"
          onCta={() => router.back()}
        />
      )}

      {listing && (
        <>
          <ScrollView
            contentContainerStyle={{
              paddingTop: insets.top + 8,
              paddingBottom: bottomBarHeight + 16,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          >
            <ScreenTitle title="İlan Detayı" />

            <ListingDetail listing={listing} />

            <View className="mx-4 h-px bg-neutral-200 dark:bg-neutral-800" />
            <View className="px-4 py-5">
              <Text
                variant="caption"
                color="secondary"
                className="mb-4 font-semibold uppercase tracking-widest"
              >
                Teklifler
              </Text>
              <Text variant="body" color="secondary">
                {listing.offerCount === 0
                  ? 'Henüz teklif gönderilmemiş. İlk teklife sen de katıl.'
                  : `Bu ilana ${listing.offerCount} uzman teklif gönderdi.`}
              </Text>
            </View>

            {myOffer &&
              (() => {
                const expertName = myOffer.expert?.name || getFullName(user) || 'Uzman'
                const expertInitials = myOffer.expert?.initials ?? getInitials(user) ?? '?'
                const statusCfg = OFFER_STATUS_CONFIG[myOffer.status]
                return (
                  <>
                    <View className="mx-4 h-px bg-neutral-200 dark:bg-neutral-800" />
                    <View className="gap-4 px-4 py-5">
                      <Text
                        variant="caption"
                        color="secondary"
                        className="font-semibold uppercase tracking-widest"
                      >
                        Teklif Özeti
                      </Text>

                      <View className="flex-row items-center gap-3">
                        <Avatar size="sm" initials={expertInitials} />
                        <Text variant="label" className="font-semibold">
                          {expertName}
                        </Text>
                      </View>

                      {myOffer.title ? (
                        <Text variant="label" className="font-medium leading-snug">
                          {myOffer.title}
                        </Text>
                      ) : null}

                      <View className="gap-2">
                        {myOffer.description ? (
                          <Text variant="caption" color="secondary">
                            {myOffer.description}
                          </Text>
                        ) : null}
                        <View className="flex-row items-center gap-1">
                          <Icon name={statusCfg.icon} size={13} color={statusCfg.iconColor} />
                          <Text
                            variant="caption"
                            className="font-medium"
                            style={{ color: statusCfg.iconColor }}
                          >
                            {statusCfg.label}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row">
                        <Chip
                          label={`₺${myOffer.price.toLocaleString('tr-TR')}`}
                          variant="price"
                          isSelected
                        />
                      </View>
                    </View>
                  </>
                )
              })()}
          </ScrollView>

          {listing.status === 'OPEN' && !canSendOffer && (
            <BottomActionBar>
              <View className="h-14 flex-row items-center justify-center gap-2 rounded-full bg-amber-100 px-4 dark:bg-amber-900">
                <Icon name="Clock" size={16} color="#D97706" />
                <Text
                  variant="label"
                  className="font-semibold text-amber-700 dark:text-amber-200"
                  numberOfLines={1}
                >
                  {isPendingApproval ? 'Profiliniz admin onayı bekliyor' : 'Profiliniz onaylanmadı'}
                </Text>
              </View>
            </BottomActionBar>
          )}

          {listing.status === 'OPEN' &&
            canSendOffer &&
            (hasAlreadySentOffer ? (
              <BottomActionBar>
                <View className="h-14 flex-row items-center justify-center gap-2 rounded-full border border-price-muted bg-price-subtle dark:border-green-900 dark:bg-green-950">
                  <Icon name="CheckCircle2" size={16} color="#15803D" />
                  <Text
                    variant="label"
                    className="font-semibold text-price-text dark:text-price-border"
                  >
                    Teklif Gönderildi
                  </Text>
                </View>
              </BottomActionBar>
            ) : (
              <BottomActionBar actions={[{ label: 'Teklif Gönder', onPress: handleSendOffer }]} />
            ))}
        </>
      )}
    </View>
  )
}
