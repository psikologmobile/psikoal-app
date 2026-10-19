import { View } from 'react-native'

import { clientInitial, expertListingTags, offerCountText } from '../../utils/expertListing'

import { FeeFooter } from './FeeFooter'
import { InvitedBadge } from './InvitedBadge'

import type { Listing } from '../../types/listing.types'
import type { ExpertListingAction } from '../../utils/expertListing'

import { Icon } from '@/core/components/atoms/Icon'
import { TagChip } from '@/core/components/atoms/TagChip'
import { Text } from '@/core/components/atoms/Text'
import { EnterUp, Jiggle, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'

export type ExpertListingCardProps = {
  listing: Listing
  action: ExpertListingAction
  onOpen: () => void
  onOffer: () => void
  onViewOffer: () => void
  /** Sıralı giriş (enter-up) sırası. */
  index?: number
}

/**
 * ListingCard (uzman) — danışan baş harfi + kısaltılmış ad, zaman, başlık, özet,
 * etiketler, bütçe, teklif sayısı ve FeeFooter (yalnız o anki ücret). Davet
 * rozeti; teklif verilmişse "Teklifini gör"; profil onaysız/bakiye sıfırsa "Kilitli".
 */
export function ExpertListingCard({
  listing,
  action,
  onOpen,
  onOffer,
  onViewOffer,
  index = 0,
}: ExpertListingCardProps) {
  const colors = useThemeColors()
  const who = listing.clientDisplayName ?? 'Danışan'

  return (
    <EnterUp index={index}>
      <View
        testID={`expert-listing-${listing.id}`}
        className="overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <PressableScale
          onPress={onOpen}
          scaleTo={0.98}
          accessibilityRole="button"
          accessibilityLabel={`İlan: ${listing.title}. ${who}, ${listing.createdAtRelative}`}
          accessibilityHint="İlan detayını açar"
          className="gap-2.5 px-4 pb-3 pt-4"
        >
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-1 flex-row items-center gap-2.5">
              <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-accent-soft">
                <Text className="font-body-heavy text-body-sm text-accent-soft-fg">
                  {clientInitial(listing)}
                </Text>
              </View>
              <Text numberOfLines={1} className="flex-1 font-body-semibold text-body-sm">
                {who} ·{' '}
                <Text className="text-body-sm text-fg-muted">{listing.createdAtRelative}</Text>
              </Text>
            </View>
            {listing.invitedByViewer ? <InvitedBadge /> : null}
            {listing.viewerHasOffered ? (
              <View className="rounded-full border border-border-strong px-2.5 py-1">
                <Text className="font-body-bold text-badge text-fg-muted">Teklif verdin</Text>
              </View>
            ) : null}
          </View>

          <Text className="font-body-bold text-body-lg leading-[22px]">{listing.title}</Text>
          {listing.description ? (
            <Text numberOfLines={2} className="text-body-sm text-fg-muted">
              {listing.description}
            </Text>
          ) : null}

          <View className="flex-row flex-wrap gap-1.5">
            {expertListingTags(listing).map((tag) => (
              <TagChip key={tag} label={tag} tone="bg" />
            ))}
          </View>

          <View className="flex-row justify-between gap-2">
            <Text className="font-body-semibold text-label">Bütçe {listing.budgetLabel}</Text>
            <Text className="font-body-semibold text-label text-fg-muted">
              {offerCountText(listing.offerCount)}
            </Text>
          </View>
        </PressableScale>

        <FeeFooter
          feeLabel={listing.offerFeeLabel}
          action={
            action === 'offer' ? (
              <PressableScale
                onPress={onOffer}
                haptics="medium"
                accessibilityRole="button"
                accessibilityLabel={`Teklif ver, ücret ${listing.offerFeeLabel ?? ''}`}
                className="h-[46px] justify-center rounded-md bg-primary px-4.5"
              >
                <Text className="font-body-heavy text-body text-primary-fg">Teklif ver</Text>
              </PressableScale>
            ) : action === 'viewOffer' ? (
              <PressableScale
                onPress={onViewOffer}
                accessibilityRole="button"
                accessibilityLabel="Teklifini gör"
                className="h-[46px] justify-center rounded-md border border-accent-line px-4"
              >
                <Text className="font-body-bold text-body-sm text-accent-soft-fg">
                  Teklifini gör
                </Text>
              </PressableScale>
            ) : (
              <View
                accessible
                accessibilityLabel="Kilitli: şu an teklif veremezsin"
                className="h-[46px] flex-row items-center gap-1.5 rounded-md border border-dashed border-accent-line px-3.5"
              >
                <Jiggle>
                  <Icon name="Lock" size={16} color={colors.onAccentSoft} strokeWidth={2.2} />
                </Jiggle>
                <Text className="font-body-bold text-body-sm text-accent-soft-fg">Kilitli</Text>
              </View>
            )
          }
        />
      </View>
    </EnterUp>
  )
}
