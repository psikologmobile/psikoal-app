import { View } from 'react-native'

import { offerTone } from '../utils/expertOffer'

import type { Offer } from '../types/offer.types'
import type { OfferTone } from '../utils/expertOffer'

import { Text } from '@/core/components/atoms/Text'
import { EnterUp, Pop, PressableScale, PulseDot } from '@/core/motion'
import { hoverLift } from '@/core/theme'
import { formatTry } from '@/core/utils/formatTry'
import { SESSION_MODE_LABELS } from '@/domains/listing'

export type ExpertOfferCardProps = {
  offer: Offer
  onPress: () => void
  index?: number
}

function StatusBadge({ tone, label }: { tone: OfferTone; label: string }) {
  if (tone === 'selected') {
    return (
      <Pop delay={500}>
        <View className="rounded-full bg-primary px-2.5 py-1">
          <Text className="font-body-heavy text-badge text-primary-fg">{label}</Text>
        </View>
      </Pop>
    )
  }
  if (tone === 'live') {
    return (
      <View className="flex-row items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1">
        <PulseDot size={7} />
        <Text className="font-body-bold text-badge text-accent-soft-fg">{label}</Text>
      </View>
    )
  }
  return (
    <View className="rounded-full border border-border-strong px-2.5 py-1">
      <Text className="font-body-bold text-badge text-fg-muted">{label}</Text>
    </View>
  )
}

/**
 * OfferCard (uzman · Tekliflerim) — durum (backend `statusLabel`), zaman, ilan,
 * danışan · görüşme şekli, seans ücreti ve ödenen teklif ücreti ("Ücretsiz hak").
 * "Anlaştım" bildirildiyse alt satırda belirtilir.
 */
export function ExpertOfferCard({ offer, onPress, index = 0 }: ExpertOfferCardProps) {
  const client = offer.clientContact?.fullName ?? offer.listing?.clientDisplayName ?? 'Danışan'
  const time = offer.createdAtRelative ?? ''
  const title = offer.listing?.title ?? offer.title ?? 'İlan'

  return (
    <EnterUp index={index}>
      <PressableScale
        onPress={onPress}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel={`${offer.statusLabel}: ${title}. ${client}. Ödenen ${offer.feePaidLabel ?? '—'}`}
        testID={`expert-offer-${offer.id}`}
        className={`gap-2.5 rounded-2xl border border-border bg-surface p-4 ${hoverLift}`}
      >
        <View className="flex-row items-center justify-between gap-2">
          <StatusBadge tone={offerTone(offer)} label={offer.statusLabel} />
          <Text className="text-badge text-fg-muted">{time}</Text>
        </View>
        <Text className="font-body-bold text-base leading-[21px]">{title}</Text>
        <Text className="text-label text-fg-muted">
          {client} · {SESSION_MODE_LABELS[offer.sessionType]}
        </Text>
        <View className="flex-row justify-between border-t border-border pt-2.5">
          <Text className="text-label">
            Seans <Text className="font-body-heavy text-label">{formatTry(offer.price * 100)}</Text>
          </Text>
          <Text className="text-label">
            Ödenen: <Text className="font-body-heavy text-label">{offer.feePaidLabel ?? '—'}</Text>
          </Text>
        </View>
        {offer.claimed ? (
          <Text className="font-body-bold text-badge text-primary-text">
            &quot;Anlaştım&quot; bildirildi · danışana hatırlatma gitti
          </Text>
        ) : null}
      </PressableScale>
    </EnterUp>
  )
}
