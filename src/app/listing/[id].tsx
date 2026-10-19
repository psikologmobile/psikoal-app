import { Alert, Pressable, ScrollView, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useLocalSearchParams, useRouter } from 'expo-router'

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
import { useListingDetailQuery, useCloseListingMutation, ListingDetail } from '@/domains/listing'
import { usePushTokenRegistration } from '@/domains/notification'
import { useListingOffersQuery, useOfferDetailQuery, OFFER_STATUS_CONFIG } from '@/domains/offer'
import { ExpertListingDetailScreen } from '@/screens/listing/ExpertListingDetailScreen'

/** Rol anahtarı: uzman görünümü ayrı ekranda (screens/listing). */
export default function ListingDetailRoute() {
  const role = useAuthStore((s) => s.role)
  return role === 'expert' ? <ExpertListingDetailScreen /> : <ListingDetailScreen />
}

function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const role = useAuthStore((s) => s.role)
  const { user } = useAuthStore()
  const isClient = role === 'client'
  const insets = useSafeAreaInsets()

  const listingQuery = useListingDetailQuery(id ?? '')
  const { data: listing, isLoading, isError } = listingQuery

  const listingOffersQuery = useListingOffersQuery(isClient && !!id ? id : '')
  const {
    isLoading: offersLoading,
    isError: offersError,
    refetch: refetchOffers,
  } = listingOffersQuery
  const offers = listingOffersQuery.data?.data ?? []

  const { isRefreshing, onRefresh } = useRefresh(listingQuery, listingOffersQuery)

  // Bildirim izni ilk teklif anında istenir (CLAUDE.md kural 7).
  usePushTokenRegistration(isClient && offers.length > 0)

  const hasAlreadySentOffer = !isClient && (listing?.viewerHasOffered ?? false)
  const { data: myOffer } = useOfferDetailQuery(!isClient ? (listing?.viewerOfferId ?? '') : '')

  const { mutate: closeListing, isPending: isClosing } = useCloseListingMutation()
  const { canAct: canSendOffer, isPendingApproval } = useExpertApprovalGate()

  const handleClose = () => {
    if (!id) return
    Alert.alert(
      'İlanı Kapat',
      'İlanınız kapatılacak ve yeni teklif gelmeyecek. Devam etmek istiyor musunuz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kapat',
          style: 'destructive',
          onPress: () => closeListing(id, { onSuccess: () => router.back() }),
        },
      ]
    )
  }

  const handleSendOffer = () => {
    router.push(`/offer/new?listingId=${id}` as never)
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
          <View className="mx-4 my-5 h-px bg-neutral-200 dark:bg-neutral-800" />
          <View className="gap-3 px-4">
            <Skeleton variant="line" width="35%" height={11} />
            <View className="flex-row gap-2">
              <Skeleton variant="rect" width={80} height={28} borderRadius="full" />
              <Skeleton variant="rect" width={100} height={28} borderRadius="full" />
            </View>
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

              {isClient && (
                <>
                  {offersLoading && (
                    <View className="gap-4">
                      {[1, 2, 3].map((i) => (
                        <View key={i} className="flex-row items-center gap-3">
                          <Skeleton variant="circle" width={36} height={36} />
                          <View className="flex-1 gap-2">
                            <Skeleton variant="line" width="45%" height={13} />
                            <Skeleton variant="line" width="60%" height={11} />
                          </View>
                          <Skeleton variant="line" width={30} height={13} />
                        </View>
                      ))}
                    </View>
                  )}

                  {!offersLoading && offersError && (
                    <EmptyState
                      icon="WifiOff"
                      title="Teklifler yüklenemedi"
                      description="Bağlantınızı kontrol edip tekrar deneyin."
                      ctaLabel="Tekrar Dene"
                      onCta={() => void refetchOffers()}
                      className="py-4"
                    />
                  )}

                  {!offersLoading && !offersError && offers.length === 0 && (
                    <View className="items-center gap-2 py-4">
                      <Icon name="Inbox" size={28} color="#A3A3A3" />
                      <Text variant="caption" color="secondary" align="center">
                        Henüz teklif gelmedi. Uzmanlar ilanınızı incelediğinde burada görünecek.
                      </Text>
                    </View>
                  )}

                  {!offersLoading && !offersError && offers.length > 0 && (
                    <View>
                      {offers.map((offer, idx) => {
                        const expertInitials = offer.expert?.initials ?? '?'
                        return (
                          <View key={offer.id}>
                            <Pressable
                              onPress={() => router.push(`/offer/${offer.id}` as never)}
                              className="flex-row items-center gap-3 py-3 active:opacity-70"
                            >
                              <Avatar
                                size="sm"
                                initials={expertInitials}
                                src={offer.expert?.avatarUrl ?? undefined}
                              />
                              <View className="flex-1">
                                <Text variant="label" className="font-medium" numberOfLines={1}>
                                  {offer.expert?.name ?? 'Uzman'}
                                </Text>
                                {offer.expert?.title ? (
                                  <Text variant="caption" color="secondary" numberOfLines={1}>
                                    {offer.expert.title}
                                  </Text>
                                ) : null}
                                <Pressable
                                  onPress={() => router.push(`/expert/${offer.expertId}` as never)}
                                  accessibilityRole="button"
                                  hitSlop={8}
                                  className="mt-0.5 self-start active:opacity-70"
                                >
                                  <Text variant="caption" color="brand" className="font-semibold">
                                    Uzmanı İncele
                                  </Text>
                                </Pressable>
                              </View>
                              {offer.expert?.rating != null && (
                                <View className="flex-row items-center gap-1">
                                  <Icon name="Star" size={13} color="#F59E0B" />
                                  <Text
                                    variant="caption"
                                    className="font-semibold text-neutral-700 dark:text-neutral-300"
                                  >
                                    {offer.expert.rating.toFixed(1)}
                                  </Text>
                                </View>
                              )}
                              <Icon name="ChevronRight" size={16} color="#A3A3A3" />
                            </Pressable>
                            {idx < offers.length - 1 && (
                              <View className="mx-4 h-px bg-neutral-200 dark:bg-neutral-800" />
                            )}
                          </View>
                        )
                      })}
                    </View>
                  )}
                </>
              )}

              {!isClient && (
                <Text variant="body" color="secondary">
                  {listing.offerCount === 0
                    ? 'Henüz teklif gönderilmemiş. İlk teklife sen de katıl.'
                    : `Bu ilana ${listing.offerCount} uzman teklif gönderdi.`}
                </Text>
              )}
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

          {listing.status === 'OPEN' && !isClient && !canSendOffer && (
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
            (isClient || canSendOffer) &&
            (!isClient && hasAlreadySentOffer ? (
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
              <BottomActionBar
                actions={
                  isClient
                    ? [
                        {
                          label: 'İlanı Kapat',
                          loadingLabel: 'Kapatılıyor...',
                          onPress: handleClose,
                          variant: 'ghost',
                          isLoading: isClosing,
                        },
                      ]
                    : [{ label: 'Teklif Gönder', onPress: handleSendOffer }]
                }
              />
            ))}
        </>
      )}
    </View>
  )
}
