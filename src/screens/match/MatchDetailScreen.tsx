import { View } from 'react-native'

import { useLocalSearchParams, useRouter } from 'expo-router'

import type { MatchDetail } from '@/domains/match'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Button } from '@/core/components/atoms/Button'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { StatusPill } from '@/core/components/atoms/StatusPill'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { WebPageHeader } from '@/core/components/molecules/WebPageHeader'
import { ContactCard } from '@/core/components/organisms/ContactCard'
import { Screen, WebColumns } from '@/core/components/templates'
import { useBreakpoint, useRefresh } from '@/core/hooks'
import { EnterUp, Pop } from '@/core/motion'
import { formatDate } from '@/core/utils/formatDate'
import { RESULT_LEVEL_CONFIG } from '@/domains/assessment'
import { useAuthStore } from '@/domains/auth'
import { ReviewCard } from '@/domains/expert'
import {
  MATCH_STATUS_LABELS,
  memberSinceLabel,
  offerPriceLabel,
  sessionLabel,
  toMatchCounterpart,
  useMatchDetailQuery,
} from '@/domains/match'

function Tag({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <View
      className={
        accent ? 'rounded-full bg-accent-soft px-2.5 py-1' : 'rounded-full bg-bg px-2.5 py-1'
      }
    >
      <Text
        className={
          accent
            ? 'font-body-bold text-xs text-accent-soft-fg'
            : 'font-body-semibold text-xs text-fg'
        }
      >
        {label}
      </Text>
    </View>
  )
}

/** İlan ve seçilen teklif özeti. */
function SummaryCard({ match }: { match: MatchDetail }) {
  const { listing, offer } = match
  const assessment = listing?.assessmentResult
  const tags = [
    ...(listing?.specialization ?? []),
    sessionLabel(listing?.preferredSessionType),
    listing?.budgetLabel ? `Bütçe ${listing.budgetLabel}` : null,
  ].filter((t): t is string => Boolean(t))
  const price = offerPriceLabel(offer?.price)
  return (
    <View className="gap-2.5 rounded-card bg-surface p-4">
      <Text variant="overline" color="muted">
        İlan ve seçilen teklif
      </Text>
      {listing ? (
        <Text className="font-body-bold text-base leading-5 text-fg">{listing.title}</Text>
      ) : null}
      {tags.length > 0 || assessment ? (
        <View className="flex-row flex-wrap gap-1.5">
          {tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
          {assessment ? (
            <Tag
              accent
              label={`${assessment.assessmentTitle} · ${RESULT_LEVEL_CONFIG[assessment.level].label}`}
            />
          ) : null}
        </View>
      ) : null}
      {offer ? (
        <View className="flex-row items-baseline justify-between gap-3 border-t border-border pt-2.5">
          <Text className="flex-1 text-body-sm text-fg">
            {offer.title ? (
              <Text className="font-body-bold text-body-sm text-fg">{offer.title}</Text>
            ) : null}
            {offer.title ? ' · ' : ''}
            {sessionLabel(offer.sessionType)}
          </Text>
          {price ? <Text className="font-display-bold text-xl text-fg">{price}</Text> : null}
        </View>
      ) : null}
      <Text className="text-label text-fg-muted">
        {offer?.description ? `"${offer.description}" · ` : ''}
        Eşleşme {formatDate(match.createdAt, 'long')}
      </Text>
    </View>
  )
}

function DetailSkeleton() {
  return (
    <View className="gap-3.5" accessibilityLabel="Yükleniyor">
      <Skeleton height={230} borderRadius="3xl" />
      <Skeleton height={170} borderRadius="xl" delay={120} />
      <Skeleton height={120} borderRadius="xl" delay={240} />
    </View>
  )
}

/**
 * Eşleşme detayı (b0 / b5 · Eşleşme detayı): iki yönlü iletişim kartı, ilan ve
 * teklif özeti; danışana değerlendirme hemen açık. Eşleşme sonlandırılamaz.
 */
export function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const role = useAuthStore((s) => s.role)
  const isClient = role === 'client'
  const query = useMatchDetailQuery(id ?? '')
  const { data: match, isLoading, isError, refetch } = query
  const { isRefreshing, onRefresh } = useRefresh(query)
  const { isWebLayout } = useBreakpoint()

  const status = match ? MATCH_STATUS_LABELS[match.status] : null
  const other = match ? toMatchCounterpart(match, isClient ? 'client' : 'expert') : null
  const otherSub = match
    ? isClient
      ? other?.subtitle
      : ['Danışan', memberSinceLabel(match.client.createdAt)].filter(Boolean).join(' · ')
    : null

  const statusPill = status ? (
    <StatusPill label={status} variant={match?.status === 'ACTIVE' ? 'soft' : 'neutral'} />
  ) : null

  const contactCard =
    match && other ? (
      <ContactCard
        phone={other.phone ?? undefined}
        email={other.email ?? undefined}
        header={
          <View className="flex-row items-center gap-3.5">
            <Pop>
              <View className="h-15 w-15 items-center justify-center rounded-full bg-primary">
                <Text className="font-display text-xl text-primary-fg">{other.initials}</Text>
              </View>
            </Pop>
            <View className="flex-1 gap-0.5">
              <Text className="font-body-bold text-[19px] leading-6 text-accent-soft-fg">
                {other.name}
              </Text>
              {otherSub ? <Text className="text-label text-accent-soft-fg">{otherSub}</Text> : null}
            </View>
          </View>
        }
        footer={
          !other.phone && !other.email ? (
            <Text className="text-body-sm text-accent-soft-fg">
              İletişim bilgisi henüz eklenmemiş.
            </Text>
          ) : null
        }
      />
    ) : null

  const errorState = isError ? (
    <EmptyState
      icon="SearchX"
      title="Eşleşme bulunamadı"
      description="Eşleşme kaldırılmış ya da erişimin yok."
      ctaLabel="Tekrar dene"
      onCta={() => void refetch()}
      secondaryLabel="Geri dön"
      onSecondary={() => router.back()}
    />
  ) : null

  if (isWebLayout) {
    return (
      <Screen
        testID="screen-match-detail"
        contentClassName="gap-6"
        refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <WebPageHeader
          size="md"
          backLabel="Eşleşmelerim"
          onBack={() => router.navigate('/(tabs)/matches')}
          title="Eşleşme"
          right={statusPill}
        />
        {isLoading ? <DetailSkeleton /> : null}
        {errorState}
        {match && other ? (
          <WebColumns
            asidePosition="left"
            asideWidth={400}
            testID="match-columns"
            aside={
              <EnterUp delay={60} className="gap-2.5">
                {contactCard}
                {isClient ? (
                  <Button
                    label="Uzmanı incele"
                    variant="outline"
                    onPress={() => router.push(`/expert/${match.expertId}` as never)}
                    fullWidth
                  />
                ) : null}
              </EnterUp>
            }
          >
            <EnterUp delay={120}>
              <SummaryCard match={match} />
            </EnterUp>
            {isClient ? (
              <EnterUp delay={180}>
                <ReviewCard
                  expertId={match.expertId}
                  expertName={other.name}
                  matchId={match.id}
                  sessionType={match.offer?.sessionType}
                />
              </EnterUp>
            ) : null}
          </WebColumns>
        ) : null}
      </Screen>
    )
  }

  return (
    <Screen
      testID="screen-match-detail"
      contentClassName="gap-3.5"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <EnterUp>
        <ScreenHeader title="Eşleşme" right={statusPill} />
      </EnterUp>

      {isLoading ? <DetailSkeleton /> : null}

      {errorState}

      {match && other ? (
        <>
          <EnterUp delay={60}>{contactCard}</EnterUp>

          <EnterUp delay={120}>
            <SummaryCard match={match} />
          </EnterUp>

          {isClient ? (
            <EnterUp delay={180}>
              <ReviewCard
                expertId={match.expertId}
                expertName={other.name}
                matchId={match.id}
                sessionType={match.offer?.sessionType}
              />
            </EnterUp>
          ) : null}

          {isClient ? (
            <EnterUp delay={240}>
              <Button
                label="Uzmanı incele"
                variant="outline"
                onPress={() => router.push(`/expert/${match.expertId}` as never)}
                fullWidth
              />
            </EnterUp>
          ) : null}
        </>
      ) : null}
    </Screen>
  )
}
