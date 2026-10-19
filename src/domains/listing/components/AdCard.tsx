import { View } from 'react-native'

import { adCardView, CLIENT_LISTING_STATUS, hasOpenClaim, listingTags } from '../utils/listingView'

import type { Listing } from '../types/listing.types'

import { StatusPill } from '@/core/components/atoms/StatusPill'
import { TagChip } from '@/core/components/atoms/TagChip'
import { Text } from '@/core/components/atoms/Text'
import { Pop, PressableScale } from '@/core/motion'
import { hoverLift } from '@/core/theme'

export type AdCardProps = {
  listing: Listing
  onPress: () => void
  className?: string
}

/**
 * AdCard — danışanın ilan kartı (İlanlarım): durum rozeti + hatırlatma rozeti,
 * başlık, özet, etiketler, alt satır (teklif sayısı / kalan gün).
 */
export function AdCard({ listing, onPress, className }: AdCardProps) {
  const status = CLIENT_LISTING_STATUS[listing.status]
  const view = adCardView(listing)
  const remind = hasOpenClaim(listing)

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${status.label}: ${listing.title}`}
      testID={`ad-card-${listing.id}`}
      wrapperClassName={className}
      className={`gap-2.5 rounded-2xl border border-border bg-surface p-4 ${hoverLift}`}
    >
      <View className="flex-row items-center justify-between gap-2">
        <StatusPill label={status.label} variant={status.variant} />
        {remind ? (
          <Pop delay={800}>
            <View className="rounded-full border border-primary px-2.5 py-1">
              <Text variant="badge" className="text-primary-text">
                Hatırlatma var
              </Text>
            </View>
          </Pop>
        ) : null}
      </View>
      <Text className="font-body-bold text-[17px] leading-[22px] text-fg">{listing.title}</Text>
      {view.excerpt ? (
        <Text variant="bodySm" color="muted" numberOfLines={2}>
          {view.excerpt}
        </Text>
      ) : null}
      <View className="flex-row flex-wrap gap-1.5">
        {listingTags(listing).map((tag) => (
          <TagChip key={tag} label={tag} tone="bg" />
        ))}
      </View>
      <View className="flex-row justify-between gap-3 border-t border-border pt-2">
        <Text variant="label" className="shrink text-fg" numberOfLines={1}>
          {view.left}
        </Text>
        <Text className="text-label text-fg-muted">{view.right}</Text>
      </View>
    </PressableScale>
  )
}
