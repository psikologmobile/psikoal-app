import { View } from 'react-native'

import { listingDaysLeft, offerCountLabel } from '../utils/listingView'

import type { Listing } from '../types/listing.types'
import type { AvatarProps } from '@/core/components/atoms/Avatar'

import { Text } from '@/core/components/atoms/Text'
import { AvatarStack } from '@/core/components/molecules/AvatarStack'
import { PressableScale, PulseDot } from '@/core/motion'
import { hoverLift } from '@/core/theme'

export type ActiveListingCardProps = {
  listing: Listing
  /** Teklif veren uzmanların baş harfleri (AvatarStack). */
  experts: Array<Pick<AvatarProps, 'src' | 'initials' | 'tone'>>
  /** "Son teklif 12 dk önce". */
  lastOfferLabel?: string
  onPress: () => void
}

/** Keşfet · "Aktif ilanın": nabızlı Yayında satırı, başlık, teklif veren uzmanlar. */
export function ActiveListingCard({
  listing,
  experts,
  lastOfferLabel,
  onPress,
}: ActiveListingCardProps) {
  const days = listingDaysLeft(listing.expiresAt)
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Aktif ilanın: ${listing.title}`}
      testID="active-listing-card"
      className={`gap-2.5 rounded-2xl border border-border bg-surface p-4.5 ${hoverLift}`}
    >
      <View className="flex-row items-center gap-2">
        <PulseDot size={10} colorClassName="bg-primary" />
        <Text variant="label" className="text-fg">
          {days === null ? 'Yayında' : `Yayında · ${days} gün kaldı`}
        </Text>
      </View>
      <Text className="font-body-bold text-lg text-fg">{listing.title}</Text>
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center">
          {experts.length > 0 ? (
            <AvatarStack
              avatars={experts}
              max={2}
              size="xs"
              accessibilityLabel={`${listing.offerCount} uzman teklif verdi`}
              className="mr-2.5"
            />
          ) : null}
          <Text className="font-body-semibold text-body-sm text-fg">
            {offerCountLabel(listing.offerCount)}
          </Text>
        </View>
        {lastOfferLabel ? (
          <Text className="shrink text-label text-fg-muted" numberOfLines={1}>
            {lastOfferLabel}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  )
}
