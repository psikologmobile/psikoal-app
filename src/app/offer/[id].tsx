import { Alert, Pressable, ScrollView, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useLocalSearchParams, useRouter } from 'expo-router'

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
import { useAuthStore } from '@/domains/auth'
import { SESSION_TYPE_LABELS, useMarkMatchedMutation } from '@/domains/listing'
import { useOfferDetailQuery, useWithdrawOfferMutation, OFFER_STATUS_CONFIG } from '@/domains/offer'

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const role = useAuthStore((s) => s.role)
  const isClient = role === 'client'

  const offerQuery = useOfferDetailQuery(id ?? '')
  const { data: offer, isLoading, isError } = offerQuery
  const { isRefreshing, onRefresh } = useRefresh(offerQuery)
  // Revize 2 §3.4: kabul/ret yok; danışan ilanını bu uzmanla eşleşti işaretler.
  const { mutate: markMatched, isPending: isMatching } = useMarkMatchedMutation()
  const { mutate: withdrawOffer, isPending: isWithdrawing } = useWithdrawOfferMutation()

  const isActing = isMatching || isWithdrawing
  const insets = useSafeAreaInsets()
  const bottomBarHeight = 56 + insets.bottom

  const expertInitials = offer?.expert?.initials ?? 'U'

  const statusCfg = offer ? OFFER_STATUS_CONFIG[offer.status] : null

  const handleMarkMatched = () => {
    if (!id || !offer) return
    Alert.alert(
      'Bu uzmanla eşleştim',
      'İlanınız bu uzmanla eşleşti olarak işaretlenecek ve diğer teklifler kapanacak. Devam etmek istiyor musunuz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Eşleştim',
          onPress: () =>
            markMatched(
              { listingId: offer.listingId, offerId: id },
              { onSuccess: ({ matchId }) => router.replace(`/match/${matchId}` as never) }
            ),
        },
      ]
    )
  }

  const handleWithdraw = () => {
    if (!id) return
    withdrawOffer(id, { onSuccess: () => router.back() })
  }

  return (
    <View className="flex-1 bg-surface-base dark:bg-dark-bg">
      <BackButton />

      {isLoading && (
        <View style={{ paddingTop: insets.top + 8 }}>
          <View className="items-center pb-3 pt-2">
            <Skeleton variant="line" width="30%" height={14} />
          </View>
          <View className="gap-4 px-4 py-5">
            <View className="flex-row items-center gap-3">
              <Skeleton variant="circle" width={56} height={56} />
              <View className="flex-1 gap-2">
                <Skeleton variant="line" width="45%" height={18} />
                <Skeleton variant="line" width="30%" height={12} />
              </View>
            </View>
            <Skeleton variant="line" width="70%" height={16} />
            <Skeleton variant="line" width="35%" height={11} />
          </View>
          <Divider spacing="none" className="mx-4" />
          <View className="gap-4 px-4 py-5">
            <Skeleton variant="line" width="25%" height={11} />
            <Skeleton variant="rect" width={100} height={28} borderRadius="full" />
            <Skeleton variant="line" width="20%" height={11} />
            <Skeleton variant="rect" width={80} height={28} borderRadius="full" />
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
                <Avatar
                  size="lg"
                  initials={isClient ? expertInitials : 'D'}
                  src={isClient ? (offer.expert?.avatarUrl ?? undefined) : undefined}
                />
                <View className="flex-1">
                  <Text variant="subheading" className="font-semibold leading-tight">
                    {isClient ? (offer.expert?.name ?? 'Uzman') : 'Danışan'}
                  </Text>
                  {isClient && offer.expert?.title ? (
                    <Text variant="caption" color="secondary" numberOfLines={1}>
                      {offer.expert.title}
                    </Text>
                  ) : null}
                  {isClient ? (
                    <Pressable
                      onPress={() => router.push(`/expert/${offer.expertId}` as never)}
                      accessibilityRole="button"
                      hitSlop={8}
                      className="mt-1 self-start active:opacity-70"
                    >
                      <Text variant="caption" color="brand" className="font-semibold">
                        Uzmanı İncele
                      </Text>
                    </Pressable>
                  ) : null}
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
                {isClient && offer.expert?.rating != null && (
                  <View className="shrink-0 flex-row items-center gap-1.5">
                    <Icon name="Star" size={13} color="#F59E0B" />
                    <Text variant="caption" color="tertiary">
                      {offer.expert.rating.toFixed(1)}
                    </Text>
                  </View>
                )}
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
              actions={
                isClient
                  ? [
                      {
                        label: 'Bu uzmanla eşleştim',
                        loadingLabel: 'İşaretleniyor...',
                        onPress: handleMarkMatched,
                        isLoading: isMatching,
                        isDisabled: isActing,
                      },
                    ]
                  : [
                      {
                        label: 'Teklifi Geri Çek',
                        loadingLabel: 'Geri Çekiliyor...',
                        onPress: handleWithdraw,
                        variant: 'ghost',
                        isLoading: isWithdrawing,
                      },
                    ]
              }
            />
          )}
        </>
      )}
    </View>
  )
}
