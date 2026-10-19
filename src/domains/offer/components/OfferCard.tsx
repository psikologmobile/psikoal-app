import { View } from 'react-native'

import { OFFER_SESSION_LABELS } from '../offer.constants'

import { ClaimBadge } from './ClaimBadge'

import type { Offer } from '../types/offer.types'

import { Avatar } from '@/core/components/atoms/Avatar'
import { TagChip } from '@/core/components/atoms/TagChip'
import { Text } from '@/core/components/atoms/Text'
import { VerifiedBadge } from '@/core/components/atoms/VerifiedBadge'
import { PressableScale } from '@/core/motion'
import { hoverLift } from '@/core/theme'
import { formatTry } from '@/core/utils/formatTry'

export type OfferCardProps = {
  offer: Offer
  /** Uzman bu ilan için "Danışanla anlaştım" bildirdi (ilanın `claims` listesinde). */
  claimed?: boolean
  /** Profil / Detay / Anlaştım satırı (yalnız yayındaki ilanda). */
  showActions?: boolean
  onProfile?: () => void
  onDetail?: () => void
  onAgree?: () => void
}

function ActionButton({
  label,
  onPress,
  tone = 'outline',
  wide = false,
}: {
  label: string
  onPress?: () => void
  tone?: 'outline' | 'soft'
  wide?: boolean
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      wrapperClassName={wide ? 'flex-[1.4]' : 'flex-1'}
      className={
        tone === 'soft'
          ? 'h-11 items-center justify-center rounded-sm bg-accent-soft'
          : 'h-11 items-center justify-center rounded-sm border border-border-strong'
      }
    >
      <Text
        className={
          tone === 'soft'
            ? 'font-body-bold text-body-sm text-accent-soft-fg'
            : 'font-body-semibold text-body-sm text-fg'
        }
      >
        {label}
      </Text>
    </PressableScale>
  )
}

/**
 * OfferCard — danışanın gördüğü teklif: uzman özeti, seans ücreti, puan, görüşme,
 * zaman, "Anlaştık dedi" rozeti, teklif başlığı ve notu, eylemler. Hiçbiri gizlenmez.
 */
export function OfferCard({
  offer,
  claimed = false,
  showActions = false,
  onProfile,
  onDetail,
  onAgree,
}: OfferCardProps) {
  const name = offer.expert?.name ?? 'Uzman'
  return (
    <View
      testID={`offer-card-${offer.id}`}
      className={`gap-3 rounded-2xl border border-border bg-surface p-4 ${hoverLift}`}
    >
      <View className="flex-row items-center gap-3">
        <Avatar
          size="md"
          tone="accent"
          initials={offer.expert?.initials ?? undefined}
          src={offer.expert?.avatarUrl ?? undefined}
        />
        <View className="min-w-0 flex-1 gap-0.5">
          <View className="flex-row items-center gap-1.5">
            <Text className="shrink font-body-bold text-base text-fg" numberOfLines={1}>
              {name}
            </Text>
            <VerifiedBadge size={16} />
          </View>
          {offer.expert?.title ? (
            <Text className="text-label text-fg-muted" numberOfLines={1}>
              {offer.expert.title}
            </Text>
          ) : null}
        </View>
        <View className="items-end">
          <Text variant="number">{formatTry(offer.price * 100)}</Text>
          <Text className="text-xs text-fg-muted">seans</Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-1.5">
        {offer.expert ? (
          <TagChip label={`★ ${offer.expert.rating.toFixed(1).replace('.', ',')}`} tone="bg" />
        ) : null}
        <TagChip label={OFFER_SESSION_LABELS[offer.sessionType]} tone="bg" />
        {offer.createdAtRelative ? <TagChip label={offer.createdAtRelative} tone="bg" /> : null}
        {claimed ? <ClaimBadge /> : null}
      </View>

      {offer.title || offer.description ? (
        <View className="gap-1">
          {offer.title ? (
            <Text className="font-body-bold text-body text-fg">{offer.title}</Text>
          ) : null}
          {offer.description ? (
            <Text variant="bodySm" color="muted">
              {offer.description}
            </Text>
          ) : null}
        </View>
      ) : null}

      {showActions ? (
        <View className="flex-row gap-2">
          <ActionButton label="Profil" onPress={onProfile} />
          <ActionButton label="Detay" onPress={onDetail} />
          <ActionButton label="Anlaştım" onPress={onAgree} tone="soft" wide />
        </View>
      ) : null}
    </View>
  )
}
