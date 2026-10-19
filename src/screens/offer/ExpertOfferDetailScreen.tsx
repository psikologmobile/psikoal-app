import { useState } from 'react'

import { Linking, View } from 'react-native'

import { useLocalSearchParams, useRouter } from 'expo-router'

import type { Offer } from '@/domains/offer'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { BottomSheet } from '@/core/components/organisms/BottomSheet'
import { Screen } from '@/core/components/templates'
import { useRefresh } from '@/core/hooks'
import { EnterUp, Pop, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { formatDate } from '@/core/utils/formatDate'
import { formatTry } from '@/core/utils/formatTry'
import { getInitials } from '@/core/utils/personName'
import { SESSION_MODE_LABELS } from '@/domains/listing'
import {
  isOfferContactVisible,
  offerTone,
  useOfferDetailQuery,
  useWithdrawOfferMutation,
} from '@/domains/offer'
import { getErrorMessage } from '@/lib/api'

const WITHDRAW_TEXT = 'Teklifin geri çekilecek. Ödediğin teklif ücreti iade edilmez.'

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-0.5 rounded-md bg-bg p-2.5">
      <Text className="text-badge text-fg-muted">{label}</Text>
      <Text numberOfLines={1} className="font-body-bold text-body">
        {value}
      </Text>
    </View>
  )
}

function StatusBadge({ offer }: { offer: Offer }) {
  const tone = offerTone(offer)
  if (tone === 'selected') {
    return (
      <Pop>
        <View className="rounded-full bg-primary px-2.5 py-1">
          <Text className="font-body-heavy text-badge text-primary-fg">{offer.statusLabel}</Text>
        </View>
      </Pop>
    )
  }
  if (tone === 'live') {
    return (
      <View className="rounded-full bg-accent-soft px-2.5 py-1">
        <Text className="font-body-bold text-badge text-accent-soft-fg">{offer.statusLabel}</Text>
      </View>
    )
  }
  return (
    <Pop>
      <View className="rounded-full border border-border-strong px-2.5 py-1">
        <Text className="font-body-bold text-badge text-fg-muted">{offer.statusLabel}</Text>
      </View>
    </Pop>
  )
}

function closedNote(offer: Offer): string | null {
  if (offer.status === 'WITHDRAWN') {
    return 'Teklifin geri çekildi. Danışanın iletişim bilgileri artık görünmüyor. Ödediğin teklif ücreti iade edilmez.'
  }
  if (offer.status === 'REJECTED') {
    return `Bu teklif kapandı: ${offer.statusLabel}. Ödediğin teklif ücreti iade edilmez.`
  }
  return null
}

/**
 * Teklif detayı — uzman görünümü (tasarım: b4_Teklif_detayı_uzman). İletişim
 * (teklif bekliyor ya da seçildiyse), "Danışanla anlaştım", geri çek sheet'i.
 */
export function ExpertOfferDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const colors = useThemeColors()
  const offerQuery = useOfferDetailQuery(id)
  const offer = offerQuery.data
  const withdraw = useWithdrawOfferMutation()
  const [sheetOpen, setSheetOpen] = useState(false)
  const { isRefreshing, onRefresh } = useRefresh(offerQuery)

  if (offerQuery.isLoading) {
    return (
      <Screen testID="screen-expert-offer">
        <ScreenHeader title="Teklifim" />
        <Skeleton variant="rect" height={220} borderRadius="3xl" />
        <Skeleton variant="rect" height={130} borderRadius="2xl" delay={150} />
      </Screen>
    )
  }

  if (!offer) {
    return (
      <Screen testID="screen-expert-offer">
        <ScreenHeader title="Teklifim" />
        {offerQuery.isError ? (
          <ErrorBanner
            title="Teklif yüklenemedi"
            description="Bağlantını kontrol edip tekrar dene."
            onRetry={() => void offerQuery.refetch()}
          />
        ) : (
          <EmptyState icon="SearchX" title="Teklif bulunamadı" />
        )}
      </Screen>
    )
  }

  const contact = isOfferContactVisible(offer) ? offer.clientContact : null
  const isPending = offer.status === 'PENDING'
  const note = closedNote(offer)
  const sentAt = `${formatDate(offer.createdAt, 'dayMonth')} ${formatDate(offer.createdAt, 'time')}`
  const [firstName = '', ...rest] = (contact?.fullName ?? '').split(' ')

  const footer = isPending ? (
    <View className="gap-2.5">
      <Button
        label="Danışanla anlaştım"
        size="lg"
        fullWidth
        onPress={() => router.push(`/claim/${offer.listingId}`)}
      />
      <Button
        label="Teklifi geri çek"
        variant="danger-outline"
        size="md"
        fullWidth
        onPress={() => setSheetOpen(true)}
      />
    </View>
  ) : offer.status === 'ACCEPTED' && offer.matchId ? (
    <Button
      label="Eşleşmeye git"
      size="lg"
      fullWidth
      onPress={() => router.push(`/match/${offer.matchId}`)}
    />
  ) : (
    <Button
      label="Tekliflerime dön"
      size="lg"
      fullWidth
      onPress={() => router.replace('/(tabs)/offers')}
    />
  )

  return (
    <Screen
      testID="screen-expert-offer"
      footer={footer}
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <EnterUp>
        <ScreenHeader title="Teklifim" right={<StatusBadge offer={offer} />} />
      </EnterUp>

      <EnterUp index={1}>
        <View
          className={`gap-3 rounded-3xl bg-surface p-5 ${offer.status === 'WITHDRAWN' ? 'opacity-50' : ''}`}
        >
          {offer.listing?.title ? (
            <Text className="text-label text-fg-muted">{offer.listing.title}</Text>
          ) : null}
          <Text className="font-display-bold text-number">{offer.title ?? 'Teklifin'}</Text>
          <View className="flex-row gap-2">
            <Cell label="Seans" value={formatTry(offer.price * 100)} />
            <Cell label="Görüşme" value={SESSION_MODE_LABELS[offer.sessionType]} />
            <Cell label="Ödenen" value={offer.feePaidLabel ?? '—'} />
          </View>
          {offer.description ? (
            <Text className="text-body-sm leading-[21px] text-fg-muted">{offer.description}</Text>
          ) : null}
          <Text className="text-badge text-fg-muted">Gönderim: {sentAt}</Text>
        </View>
      </EnterUp>

      {contact ? (
        <EnterUp index={2}>
          <View testID="offer-contact" className="gap-3 rounded-2xl bg-accent-soft p-4.5">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-bg">
                <Text className="font-body-heavy text-body">
                  {getInitials({ firstName, lastName: rest.join(' ') })}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-body-bold text-base text-accent-soft-fg">
                  {contact.fullName}
                </Text>
                <Text selectable className="text-label text-accent-soft-fg">
                  {[contact.phone, contact.email].filter(Boolean).join(' · ')}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              {contact.phone ? (
                <PressableScale
                  onPress={() =>
                    void Linking.openURL(`tel:${contact.phone?.replace(/[^\d+]/g, '')}`)
                  }
                  haptics="medium"
                  accessibilityRole="link"
                  accessibilityLabel={`Ara: ${contact.phone}`}
                  wrapperClassName="flex-1"
                  className="h-12 flex-row items-center justify-center gap-1.5 rounded-md bg-primary"
                >
                  <Icon name="Phone" size={16} color={colors.onPrimary} strokeWidth={2.2} />
                  <Text className="font-body-heavy text-body text-primary-fg">Ara</Text>
                </PressableScale>
              ) : null}
              <PressableScale
                onPress={() => void Linking.openURL(`mailto:${contact.email}`)}
                accessibilityRole="link"
                accessibilityLabel={`E-posta gönder: ${contact.email}`}
                wrapperClassName="flex-1"
                className="h-12 items-center justify-center rounded-md border border-accent-line"
              >
                <Text className="font-body-bold text-body text-accent-soft-fg">E-posta</Text>
              </PressableScale>
            </View>
          </View>
        </EnterUp>
      ) : null}

      {offer.claimed && isPending ? (
        <EnterUp index={3}>
          <Text className="font-body-bold text-label text-primary-text">
            &quot;Anlaştım&quot; bildirildi · danışana hatırlatma gitti
          </Text>
        </EnterUp>
      ) : null}

      {note ? (
        <EnterUp index={2}>
          <View className="rounded-card border border-dashed border-border-strong p-4">
            <Text className="text-body-sm text-fg-muted">{note}</Text>
          </View>
        </EnterUp>
      ) : null}

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Teklifi geri çek"
        description={WITHDRAW_TEXT}
        actions={
          <View className="gap-2.5">
            {withdraw.error ? <ErrorBanner message={getErrorMessage(withdraw.error)} /> : null}
            <View className="flex-row gap-2.5">
              <View className="flex-1">
                <Button
                  label="Vazgeç"
                  variant="outline"
                  size="lg"
                  fullWidth
                  onPress={() => setSheetOpen(false)}
                />
              </View>
              <View className="flex-1">
                <Button
                  label="Geri çek"
                  variant="danger"
                  size="lg"
                  fullWidth
                  isLoading={withdraw.isPending}
                  loadingLabel="Geri çekiliyor…"
                  onPress={() =>
                    withdraw.mutate(offer.id, { onSuccess: () => setSheetOpen(false) })
                  }
                />
              </View>
            </View>
          </View>
        }
      />
    </Screen>
  )
}
