import { ScrollView, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Avatar } from '@/core/components/atoms/Avatar'
import { Chip } from '@/core/components/atoms/Chip'
import { Divider } from '@/core/components/atoms/Divider'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { BackButton } from '@/core/components/molecules/BackButton'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ScreenTitle } from '@/core/components/molecules/ScreenTitle'
import { BottomActionBar } from '@/core/components/organisms/BottomActionBar'
import { useRefresh } from '@/core/hooks'
import { AssessmentResultSummary } from '@/domains/assessment'
import { SESSION_TYPE_LABELS } from '@/domains/listing'
import { useOfferDetailQuery, useWithdrawOfferMutation, OFFER_STATUS_CONFIG } from '@/domains/offer'

type ExpertOfferDetailScreenProps = {
  offerId: string
}

/**
 * Uzman · Teklif detayı — GEÇİCİ: eski ekranın uzman dalı olduğu gibi taşındı (G2 rol
 * ayrımı). v2 tasarımı G3 grubunda yazılacak ve bu dosyanın yerini alacak.
 */
export function ExpertOfferDetailScreen({ offerId }: ExpertOfferDetailScreenProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const offerQuery = useOfferDetailQuery(offerId)
  const { data: offer, isLoading, isError } = offerQuery
  const { isRefreshing, onRefresh } = useRefresh(offerQuery)
  const { mutate: withdrawOffer, isPending: isWithdrawing } = useWithdrawOfferMutation()

  const bottomBarHeight = 56 + insets.bottom
  const statusCfg = offer ? OFFER_STATUS_CONFIG[offer.status] : null

  const handleWithdraw = () => {
    if (!offerId) return
    withdrawOffer(offerId, { onSuccess: () => router.back() })
  }

  return (
    <View className="flex-1 bg-surface-base dark:bg-dark-bg">
      <BackButton />

      {isLoading && (
        <View style={{ paddingTop: insets.top + 8 }}>
          <View className="gap-4 px-4 py-5">
            <View className="flex-row items-center gap-3">
              <Skeleton variant="circle" width={56} height={56} />
              <View className="flex-1 gap-2">
                <Skeleton variant="line" width="45%" height={18} />
                <Skeleton variant="line" width="30%" height={12} />
              </View>
            </View>
            <Skeleton variant="line" width="70%" height={16} />
          </View>
        </View>
      )}

      {isError && (
        <EmptyState
          icon="AlertCircle"
          title="Teklif bulunamadı"
          ctaLabel="Geri Dön"
          onCta={() => router.back()}
        />
      )}

      {!isLoading && !isError && offer && (
        <>
          <ScrollView
            contentContainerStyle={{
              paddingTop: insets.top + 8,
              paddingBottom: offer.status === 'PENDING' ? bottomBarHeight + 16 : 48,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          >
            <ScreenTitle title="Teklif Detayı" />

            <View className="gap-4 px-4 py-5">
              <View className="flex-row items-center gap-3">
                <Avatar size="lg" initials="D" />
                <View className="flex-1">
                  <Text variant="subheading" className="font-semibold leading-tight">
                    Danışan
                  </Text>
                </View>
              </View>

              {offer.title || offer.listing?.title ? (
                <Text variant="subheading" className="leading-snug">
                  {offer.title || offer.listing?.title}
                </Text>
              ) : null}

              <View className="flex-row flex-wrap items-center gap-3">
                {statusCfg && (
                  <View className="shrink-0 flex-row items-center gap-1.5">
                    <Icon name={statusCfg.icon} size={13} color={statusCfg.iconColor} />
                    <Text variant="caption" style={{ color: statusCfg.iconColor }}>
                      {offer.statusLabel}
                    </Text>
                  </View>
                )}
                {offer.listing?.city ? (
                  <View className="shrink-0 flex-row items-center gap-1.5">
                    <Icon name="MapPin" size={13} color="#A3A3A3" />
                    <Text variant="caption" color="tertiary">
                      {offer.listing.city}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Divider spacing="none" className="mx-4" />
            <View className="gap-5 px-4 py-5">
              {offer.description ? (
                <View className="gap-2">
                  <Text
                    variant="caption"
                    color="secondary"
                    className="font-semibold uppercase tracking-widest"
                  >
                    Uzman Notu
                  </Text>
                  <Text variant="body" color="secondary" className="leading-relaxed">
                    {offer.description}
                  </Text>
                </View>
              ) : null}

              <View className="gap-2">
                <Text
                  variant="caption"
                  color="secondary"
                  className="font-semibold uppercase tracking-widest"
                >
                  Seans Tipi
                </Text>
                <View className="flex-row">
                  <Chip
                    label={SESSION_TYPE_LABELS[offer.sessionType] ?? offer.sessionType}
                    variant="session"
                    isSelected
                  />
                </View>
              </View>

              <View className="gap-2">
                <Text
                  variant="caption"
                  color="secondary"
                  className="font-semibold uppercase tracking-widest"
                >
                  Fiyat
                </Text>
                <View className="flex-row">
                  <Chip
                    label={`₺${offer.price.toLocaleString('tr-TR')}`}
                    variant="price"
                    isSelected
                  />
                </View>
              </View>
            </View>

            {offer.listing?.assessmentResult ? (
              <>
                <Divider spacing="none" className="mx-4" />
                <AssessmentResultSummary result={offer.listing.assessmentResult} />
              </>
            ) : null}
          </ScrollView>

          {offer.status === 'PENDING' && (
            <BottomActionBar
              actions={[
                {
                  label: 'Teklifi Geri Çek',
                  loadingLabel: 'Geri Çekiliyor...',
                  onPress: handleWithdraw,
                  variant: 'ghost',
                  isLoading: isWithdrawing,
                },
              ]}
            />
          )}
        </>
      )}
    </View>
  )
}
