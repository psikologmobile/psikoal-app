import { View } from 'react-native'

import type { ExpertListingDetailView, Listing } from '@/domains/listing'

import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { InfoTile } from '@/core/components/molecules/InfoTile'
import { WebPageHeader } from '@/core/components/molecules/WebPageHeader'
import { ContactCard } from '@/core/components/organisms/ContactCard'
import { WebColumns, WebGrid } from '@/core/components/templates'
import { EnterUp, Float, Glow, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { ProfileRejectedNotice } from '@/domains/expert'
import { InvitedBadge, SESSION_MODE_LABELS } from '@/domains/listing'

export type ExpertListingDetailWebProps = {
  listing: Listing
  view: ExpertListingDetailView
  clientName: string
  memberSince: string
  levelLabel: string | null
  /** Bakiye ve ücretsiz hak satırı ("Bakiyen ₺1.250 · 2 ücretsiz hak"). */
  balanceLine: string | null
  insufficient: boolean
  isRejected: boolean
  rejectionReason: string | null
  /** Bilgi ızgarası 4 sütun mu (>860 px). */
  wideInfo: boolean
  onBack: () => void
  onSendOffer: () => void
  onTopup: () => void
  onViewOffer: () => void
  onClaim: () => void
  onUpdateDocuments: () => void
}

/**
 * Uzman · İlan detayı — web/tablet yerleşimi (tasarım: b1_Web_İlan_detayı_uzman).
 * Sol: açıklama + 4'lü bilgi + test sonucu; sağ (380 · ≤1100 320 · ≤860 alta):
 * teklif ücreti kartı ya da açılan iletişim. Ücret düşüş göstergesi çizilmez.
 */
export function ExpertListingDetailWeb(props: ExpertListingDetailWebProps) {
  const { listing, view } = props
  const colors = useThemeColors()
  const contact = listing.clientContact

  const aside = (
    <>
      {props.isRejected ? (
        <ProfileRejectedNotice reason={props.rejectionReason} onUpdate={props.onUpdateDocuments} />
      ) : null}

      {view.showFeeBar ? (
        <EnterUp index={2}>
          <View
            testID="listing-fee-bar"
            className="gap-3.5 rounded-3xl border border-border p-[22px]"
          >
            <Text className="text-label text-fg-muted">Teklif ücreti</Text>
            <Text className="font-display text-[44px] leading-[46px] text-fg">
              {listing.offerFeeLabel ?? '—'}
            </Text>
            {props.balanceLine ? (
              <Text className="text-label text-fg-muted">{props.balanceLine}</Text>
            ) : null}
            {view.blockLabel ? (
              <View
                accessibilityRole="alert"
                className="rounded-2xl border border-danger bg-danger-soft p-4"
              >
                <Text className="font-body-bold text-body-sm text-danger-soft-fg">
                  {view.blockLabel}
                </Text>
              </View>
            ) : (
              <Glow>
                <PressableScale
                  onPress={props.onSendOffer}
                  haptics="medium"
                  accessibilityRole="button"
                  accessibilityLabel={`Teklif gönder, ücret ${listing.offerFeeLabel ?? ''}`}
                  testID="listing-send-offer"
                  className="h-btn-lg items-center justify-center rounded-lg bg-primary"
                >
                  <Text className="font-body-heavy text-base text-primary-fg">Teklif gönder</Text>
                </PressableScale>
              </Glow>
            )}
            {props.insufficient ? (
              <Button label="Bakiye yükle" icon="Wallet" fullWidth onPress={props.onTopup} />
            ) : null}
          </View>
        </EnterUp>
      ) : null}

      {!view.offered && !view.closedText ? (
        <EnterUp index={3}>
          <View className="flex-row items-center gap-3 rounded-card bg-accent-soft p-4">
            <Float distance={5} duration={1600}>
              <View className="h-[42px] w-[42px] items-center justify-center rounded-sm bg-bg">
                <Icon name="Lock" size={20} color={colors.primaryText} />
              </View>
            </Float>
            <Text className="flex-1 text-body-sm text-accent-soft-fg">
              Teklif gönderince danışanın iletişim bilgileri sana açılır.
            </Text>
          </View>
        </EnterUp>
      ) : null}

      {view.offered && contact ? (
        <EnterUp index={2}>
          <View testID="listing-contact" className="gap-2.5">
            <ContactCard
              phone={contact.phone ?? undefined}
              email={contact.email}
              header={
                <View className="gap-0.5">
                  <Text className="font-body-bold text-base text-accent-soft-fg">
                    İletişim bilgileri açık
                  </Text>
                  <Text className="text-body-sm text-accent-soft-fg">{contact.fullName}</Text>
                </View>
              }
            />
            {listing.viewerOfferId ? (
              <Button
                label="Teklifimi gör"
                variant="outline"
                fullWidth
                onPress={props.onViewOffer}
              />
            ) : null}
            {view.canClaim ? (
              <Button
                label="Danışanla anlaştım"
                variant="outline"
                fullWidth
                onPress={props.onClaim}
              />
            ) : null}
          </View>
        </EnterUp>
      ) : null}

      {view.closedText ? (
        <EnterUp index={2}>
          <View
            accessibilityRole="alert"
            className="rounded-2xl border border-danger bg-danger-soft p-[18px]"
          >
            <Text className="text-body-sm text-danger-soft-fg">{view.closedText}</Text>
          </View>
        </EnterUp>
      ) : null}
    </>
  )

  return (
    <>
      <WebPageHeader
        size="md"
        backLabel="Fırsatlar"
        onBack={props.onBack}
        eyebrow={
          <>
            {listing.invitedByViewer ? <InvitedBadge label="Davet edildin" delay={400} /> : null}
            <Text className="text-body-sm text-fg-muted">
              {props.clientName} · {props.memberSince}
            </Text>
          </>
        }
        title={listing.title}
      />
      <WebColumns
        aside={aside}
        asideWidth={380}
        asideWidthNarrow={320}
        stackAt={860}
        testID="expert-listing-columns"
      >
        {listing.description ? (
          <EnterUp index={1}>
            <Text className="text-[17px] leading-[27px] text-fg-muted">{listing.description}</Text>
          </EnterUp>
        ) : null}
        <EnterUp index={2}>
          <WebGrid columns={props.wideInfo ? 4 : 2} gapClassName="gap-2.5">
            <InfoTile label="Alan" value={listing.specialization.join(', ') || '—'} />
            <InfoTile
              label="Görüşme"
              value={`${SESSION_MODE_LABELS[listing.preferredSessionType]}${listing.city ? ` · ${listing.city}` : ''}`}
            />
            <InfoTile label="Bütçe" value={listing.budgetLabel} />
            <InfoTile
              label="Teklif"
              value={listing.offerCount > 0 ? `${listing.offerCount} uzman` : 'Henüz yok'}
            />
          </WebGrid>
        </EnterUp>
        {listing.assessmentResult ? (
          <EnterUp index={3}>
            <View className="gap-2 rounded-card border border-border p-[18px]">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="flex-1 font-body-bold text-base">
                  {listing.assessmentResult.assessmentTitle}
                </Text>
                <View className="rounded-full bg-accent-soft px-3 py-1">
                  <Text className="font-body-heavy text-label text-accent-soft-fg">
                    {props.levelLabel} · {listing.assessmentResult.score}
                  </Text>
                </View>
              </View>
              <Text className="text-body-sm text-fg-muted">{listing.assessmentResult.summary}</Text>
            </View>
          </EnterUp>
        ) : null}
      </WebColumns>
    </>
  )
}
