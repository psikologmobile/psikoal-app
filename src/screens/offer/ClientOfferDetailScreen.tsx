import { View } from 'react-native'

import { useRouter } from 'expo-router'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Avatar } from '@/core/components/atoms/Avatar'
import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { TagChip } from '@/core/components/atoms/TagChip'
import { Text } from '@/core/components/atoms/Text'
import { VerifiedBadge } from '@/core/components/atoms/VerifiedBadge'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { Screen } from '@/core/components/templates'
import { useRefresh } from '@/core/hooks'
import { CountRoll, EnterUp, Pop, PressableScale, TypeReveal } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { formatTry } from '@/core/utils/formatTry'
import { RESULT_LEVEL_LABELS } from '@/domains/assessment'
import { MatchConfirmSheet, useMatchConfirm } from '@/domains/listing'
import { OFFER_SESSION_LABELS, useOfferDetailQuery } from '@/domains/offer'

type ClientOfferDetailScreenProps = {
  offerId: string
}

/** Danışan · Teklif detayı (tasarım: b0_Teklif_detayı_danışan). Kabul/ret yok. */
export function ClientOfferDetailScreen({ offerId }: ClientOfferDetailScreenProps) {
  const router = useRouter()
  const colors = useThemeColors()
  const offerQuery = useOfferDetailQuery(offerId)
  const { isRefreshing, onRefresh } = useRefresh(offerQuery)
  const offer = offerQuery.data

  const match = useMatchConfirm({
    listingId: offer?.listingId,
    onMatched: (matchId) =>
      router.replace({ pathname: '/match/[id]', params: { id: matchId, celebrate: '1' } }),
  })

  const header = <ScreenHeader title="Teklif" onBack={() => router.back()} />

  if (offerQuery.isLoading) {
    return (
      <Screen testID="screen-offer-detail">
        {header}
        <View accessibilityLabel="Yükleniyor" className="gap-4">
          <Skeleton height={88} borderRadius="2xl" />
          <Skeleton height={170} borderRadius="3xl" delay={120} />
          <Skeleton height={90} borderRadius="xl" delay={240} />
        </View>
      </Screen>
    )
  }

  if (offerQuery.isError || !offer) {
    return (
      <Screen testID="screen-offer-detail">
        {header}
        <EmptyState
          icon="FileX"
          title="Teklif bulunamadı"
          description="Teklif kaldırılmış ya da artık görüntülenemiyor."
          ctaLabel="Geri dön"
          onCta={() => router.back()}
        />
      </Screen>
    )
  }

  const expertName = offer.expert?.name ?? 'Uzman'
  const canMatch = offer.status === 'PENDING'
  const result = offer.listing?.assessmentResult
  const expertMeta = [
    offer.expert?.title,
    offer.expert ? `★ ${offer.expert.rating.toFixed(1).replace('.', ',')}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Screen
      testID="screen-offer-detail"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      contentClassName="flex-1 gap-4"
      footer={
        <View className="w-full gap-2.5">
          {canMatch ? (
            <Button
              label="Bu uzmanla anlaştım"
              size="xl"
              fullWidth
              testID="offer-agree"
              onPress={() =>
                match.ask({
                  offerId: offer.id,
                  expertName,
                  expertInitials: offer.expert?.initials ?? undefined,
                })
              }
            />
          ) : null}
          <Button
            label="Tüm tekliflere dön"
            variant="outline"
            size="md"
            fullWidth
            onPress={() => router.replace(`/listing/${offer.listingId}`)}
          />
        </View>
      }
    >
      <EnterUp>{header}</EnterUp>

      <EnterUp index={1}>
        <PressableScale
          onPress={() =>
            router.push({
              pathname: '/expert/[id]',
              params: { id: offer.expertId, offerId: offer.id },
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`${expertName} profilini gör`}
          className="flex-row items-center gap-3.5 rounded-2xl border border-border bg-surface p-4"
        >
          <Pop>
            <Avatar
              size="xl"
              tone="accent"
              initials={offer.expert?.initials ?? undefined}
              src={offer.expert?.avatarUrl ?? undefined}
            />
          </Pop>
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="shrink font-body-bold text-lg text-fg" numberOfLines={1}>
                {expertName}
              </Text>
              <VerifiedBadge size={18} />
            </View>
            {expertMeta ? <Text className="text-label text-fg-muted">{expertMeta}</Text> : null}
          </View>
          <Icon name="ChevronRight" size={20} color={colors.textMuted} />
        </PressableScale>
      </EnterUp>

      <EnterUp index={2} className="gap-3.5 rounded-3xl bg-accent-soft p-[22px]">
        <View className="flex-row items-end justify-between gap-3">
          <View className="gap-0.5">
            <Text className="font-body-semibold text-label text-accent-soft-fg">Seans ücreti</Text>
            <CountRoll
              value={formatTry(offer.price * 100)}
              className="font-display text-[44px] leading-[46px] text-accent-soft-fg"
              offset={44}
              accessibilityLabel={`Seans ücreti ${formatTry(offer.price * 100)}`}
            />
          </View>
          <View className="rounded-full bg-bg px-3 py-1.5">
            <Text className="font-body-bold text-label text-fg">{offer.statusLabel}</Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1 gap-0.5 rounded-md bg-bg p-3">
            <Text className="text-xs text-fg-muted">Görüşme</Text>
            <Text className="font-body-bold text-body text-fg">
              {OFFER_SESSION_LABELS[offer.sessionType]}
            </Text>
          </View>
          <View className="flex-1 gap-0.5 rounded-md bg-bg p-3">
            <Text className="text-xs text-fg-muted">Gönderim</Text>
            <Text className="font-body-bold text-body text-fg">
              {offer.createdAtRelative ?? '—'}
            </Text>
          </View>
        </View>
      </EnterUp>

      {offer.title || offer.description ? (
        <EnterUp index={3} className="gap-2">
          {offer.title ? (
            <Text variant="title" accessibilityRole="header">
              {offer.title}
            </Text>
          ) : null}
          {offer.description ? (
            <TypeReveal>
              <Text className="text-body leading-6 text-fg-muted">{offer.description}</Text>
            </TypeReveal>
          ) : null}
        </EnterUp>
      ) : null}

      {offer.listing ? (
        <EnterUp index={4}>
          <PressableScale
            onPress={() => router.replace(`/listing/${offer.listingId}`)}
            accessibilityRole="button"
            accessibilityLabel={`İlgili ilan: ${offer.listing.title}`}
            className="gap-1.5 rounded-xl border border-border px-4 py-3.5"
          >
            <Text variant="overline" color="muted">
              İlgili ilan
            </Text>
            <Text className="font-body-bold text-body text-fg">{offer.listing.title}</Text>
            {result ? (
              <View className="self-start">
                <TagChip
                  tone="accent"
                  label={`${result.assessmentTitle} · ${RESULT_LEVEL_LABELS[result.level]} · ${result.score} puan`}
                />
              </View>
            ) : null}
          </PressableScale>
        </EnterUp>
      ) : null}

      <MatchConfirmSheet
        target={match.target}
        onCancel={match.cancel}
        onConfirm={match.confirm}
        isPending={match.isPending}
        errorMessage={match.errorMessage}
      />
    </Screen>
  )
}
