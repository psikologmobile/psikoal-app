import { useState } from 'react'

import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { useLocalSearchParams, useRouter } from 'expo-router'

import type { Offer, OfferQuote, SendOfferRequest } from '@/domains/offer'

import { Avatar } from '@/core/components/atoms/Avatar'
import { Button } from '@/core/components/atoms/Button'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { SegmentedControl } from '@/core/components/molecules/SegmentedControl'
import { TextArea } from '@/core/components/molecules/TextArea'
import { TextField } from '@/core/components/molecules/TextField'
import { ContactCard } from '@/core/components/organisms/ContactCard'
import { SuccessHero } from '@/core/components/organisms/SuccessHero'
import { Screen } from '@/core/components/templates'
import { EnterUp, haptic } from '@/core/motion'
import { getInitials } from '@/core/utils/personName'
import { useExpertApprovalGate } from '@/domains/expert'
import { SESSION_MODE_LABELS, useListingDetailQuery } from '@/domains/listing'
import { usePushRegistration } from '@/domains/notification'
import {
  OfferFeePanel,
  SendOfferSchema,
  resolveOfferComposerState,
  useOfferFeeGate,
  useOfferQuoteQuery,
  useSendOfferMutation,
} from '@/domains/offer'
import { useWalletQuery } from '@/domains/wallet'

const SESSION_OPTIONS = (['online', 'yüz_yüze', 'yüz_yüze_online'] as const).map((value) => ({
  value,
  label: SESSION_MODE_LABELS[value],
}))

type SentResult = { offer: Offer; quote: OfferQuote | undefined }

function SentView({
  result,
  onBack,
  onView,
}: {
  result: SentResult
  onBack: () => void
  onView: () => void
}) {
  const wallet = useWalletQuery().data
  const { offer, quote } = result
  const contact = offer.clientContact
  const [firstName = '', ...rest] = (contact?.fullName ?? '').split(' ')
  const line = offer.usedFreeRight
    ? `Ücretsiz hakkın kullanıldı${wallet ? `, kalan ${wallet.freeOfferRights} hak` : ''}.`
    : `${offer.feePaidLabel ?? quote?.feeLabel ?? ''} bakiyenden düştü, kalan bakiyen ${wallet?.balanceLabel ?? quote?.balanceAfterLabel ?? ''}.`

  return (
    <Screen
      testID="screen-offer-sent"
      contentClassName="gap-6 pt-12"
      footer={
        <View className="gap-1">
          <Button label="Fırsatlara dön" variant="outline" size="lg" fullWidth onPress={onBack} />
          <Button label="Teklifimi gör" variant="link" onPress={onView} />
        </View>
      }
    >
      <SuccessHero
        title="Teklif gönderildi"
        tone="primary"
        description={`${line} Danışanın iletişim bilgileri artık açık.`}
      >
        {contact ? (
          <ContactCard
            phone={contact.phone ?? undefined}
            email={contact.email}
            header={
              <View className="flex-row items-center gap-3">
                <Avatar size="lg" initials={getInitials({ firstName, lastName: rest.join(' ') })} />
                <View className="flex-1">
                  <Text className="font-display-bold text-number text-accent-soft-fg">
                    {contact.fullName}
                  </Text>
                  {offer.listing?.title ? (
                    <Text numberOfLines={1} className="text-label text-accent-soft-fg">
                      {offer.listing.title}
                    </Text>
                  ) : null}
                </View>
              </View>
            }
          />
        ) : null}
      </SuccessHero>
    </Screen>
  )
}

/**
 * Teklif gönder (tasarım: b4_Teklif_gönder). Durumlar: normal · ücretsiz ·
 * ücretDeğişti · bakiyeYetersiz · onayBekliyor · reddedildi · zatenVerdin ·
 * ilanKapalı · hata; başarıda SuccessHero → iletişim kartı.
 */
export function SendOfferScreen() {
  const router = useRouter()
  const { listingId = '' } = useLocalSearchParams<{ listingId?: string }>()
  const listingQuery = useListingDetailQuery(listingId)
  const listing = listingQuery.data
  const gate = useExpertApprovalGate()
  const send = useSendOfferMutation()
  const registerPush = usePushRegistration()
  const feeGate = useOfferFeeGate({ listingId: listingId || undefined, submitError: send.error })
  const quoteQuery = useOfferQuoteQuery(listingId || undefined)
  const [sentFeeLabel, setSentFeeLabel] = useState<string>()
  const [sent, setSent] = useState<SentResult>()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SendOfferRequest>({
    resolver: zodResolver(SendOfferSchema),
    defaultValues: { listingId, title: '', sessionType: 'online', description: '', price: 0 },
  })

  if (!listingId) {
    return (
      <Screen>
        <ScreenHeader title="Teklif gönder" />
        <EmptyState
          icon="SearchX"
          title="İlan belirtilmedi"
          description="Teklifi bir ilanın sayfasından gönderebilirsin."
          ctaLabel="Fırsatlara dön"
          onCta={() => router.replace('/')}
        />
      </Screen>
    )
  }

  if (sent) {
    return (
      <SentView
        result={sent}
        onBack={() => router.replace('/')}
        onView={() => router.replace(`/offer/${sent.offer.id}`)}
      />
    )
  }

  const state = resolveOfferComposerState({
    isLoading: listingQuery.isLoading || gate.isLoading || feeGate.isLoading,
    isPendingApproval: gate.isPendingApproval,
    isRejected: gate.isRejected,
    listing,
    quote: feeGate.quote,
    quoteFailed: !feeGate.quote && !feeGate.isLoading,
    submitError: send.error,
  })

  const quote = feeGate.quote
  // Ücret okunamadıysa düğme ücreti yeniden ister; gönderim hatasında aynı ücretle yeniden dener.
  const quoteMissing = state === 'error' && !quote
  const canSend =
    state === 'normal' || state === 'free' || state === 'feeChanged' || state === 'error'
  const ctaLabel = quoteMissing
    ? 'Tekrar dene'
    : state === 'free'
      ? 'Ücretsiz hakla gönder'
      : state === 'feeChanged'
        ? `${quote?.feeLabel ?? ''} ile gönder`
        : `Teklif gönder${quote ? ` (${quote.feeLabel})` : ''}`

  const onSubmit = (data: SendOfferRequest) => {
    if (feeGate.expectedFeeKurus === undefined) return
    const quoteAtSend = quote
    setSentFeeLabel(quote?.feeLabel)
    send.mutate(
      { ...data, expectedFeeKurus: feeGate.expectedFeeKurus },
      {
        onSuccess: (offer) => {
          haptic.success()
          // Uzman için "ilk teklif anı": seçilme bildirimi için izin burada istenir.
          void registerPush({ prompt: true })
          setSent({ offer, quote: quoteAtSend })
        },
      }
    )
  }

  return (
    <Screen
      keyboard
      testID="screen-send-offer"
      footer={
        <Button
          label={ctaLabel}
          size="xl"
          fullWidth
          isDisabled={!canSend || feeGate.isRefreshing}
          isLoading={send.isPending}
          loadingLabel="Gönderiliyor…"
          testID="offer-submit"
          onPress={quoteMissing ? () => void quoteQuery.refetch() : handleSubmit(onSubmit)}
        />
      }
    >
      <EnterUp>
        <ScreenHeader title="Teklif gönder" />
      </EnterUp>

      {listing ? (
        <EnterUp index={1}>
          <View className="gap-1 rounded-card bg-accent-soft px-4 py-3.5">
            <Text className="font-body-semibold text-label text-accent-soft-fg">
              {[
                listing.clientDisplayName,
                SESSION_MODE_LABELS[listing.preferredSessionType],
                listing.budgetLabel,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
            <Text className="font-body-bold text-base text-accent-soft-fg">{listing.title}</Text>
          </View>
        </EnterUp>
      ) : null}

      <EnterUp index={2} className="flex-row gap-2.5">
        <View className="flex-1">
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Teklif başlığı"
                optional
                placeholder="Kaygı odaklı BDT"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
              />
            )}
          />
        </View>
        <View className="flex-1">
          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Seans ücreti (₺)"
                type="number"
                placeholder="2400"
                value={value ? String(value) : ''}
                onChangeText={(text) => onChange(Number(text.replace(/[^0-9]/g, '')) || 0)}
                onBlur={onBlur}
                error={errors.price?.message}
                testID="offer-price"
              />
            )}
          />
        </View>
      </EnterUp>

      <EnterUp index={3} className="gap-1.5">
        <Text variant="label">Görüşme şekli</Text>
        <Controller
          control={control}
          name="sessionType"
          render={({ field: { onChange, value } }) => (
            <SegmentedControl
              accessibilityLabel="Görüşme şekli"
              size="lg"
              options={SESSION_OPTIONS}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </EnterUp>

      <EnterUp index={3}>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextArea
              label="Danışana not"
              optional
              value={value ?? ''}
              onChangeText={onChange}
              maxLength={300}
              error={errors.description?.message}
              placeholder="Yaklaşımını ve ilk görüşmeyi kısaca anlat."
            />
          )}
        />
      </EnterUp>

      <EnterUp index={4}>
        <OfferFeePanel state={state} quote={quote} previousFeeLabel={sentFeeLabel} />
      </EnterUp>
    </Screen>
  )
}
