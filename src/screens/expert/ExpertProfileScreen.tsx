import { useState } from 'react'

import { Linking, View } from 'react-native'

import { useRouter } from 'expo-router'

import type { Review } from '@/domains/expert'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Avatar } from '@/core/components/atoms/Avatar'
import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { IconButton } from '@/core/components/atoms/IconButton'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { TagChip } from '@/core/components/atoms/TagChip'
import { Text } from '@/core/components/atoms/Text'
import { VerifiedBadge } from '@/core/components/atoms/VerifiedBadge'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { Screen } from '@/core/components/templates'
import { useRefresh } from '@/core/hooks'
import { EnterUp, FadeIn, Orbit, Pop } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'
import { formatDate } from '@/core/utils/formatDate'
import { getFullName, getInitials } from '@/core/utils/personName'
import { useAuthStore } from '@/domains/auth'
import { useExpertProfileAccess, useExpertReviewsQuery } from '@/domains/expert'
import { CLIENT_SESSION_MODE_LABELS } from '@/domains/listing'

type ExpertProfileScreenProps = {
  expertId: string
  /** Danışanın bu uzmandan aldığı teklif — "Bu uzmanla anlaştım" o teklife gider. */
  offerId?: string
}

function Stars({ value }: { value: number }) {
  return (
    <View className="flex-row gap-0.5" accessible accessibilityLabel={`${value} yıldız`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pop key={i} delay={500 + i * 80}>
          <Text
            className={cn('text-base', i <= value ? 'text-primary-text' : 'text-border-strong')}
          >
            ★
          </Text>
        </Pop>
      ))}
    </View>
  )
}

function ReviewItem({ review }: { review: Review }) {
  const meta = [
    'Danışan',
    review.sessionType ? CLIENT_SESSION_MODE_LABELS[review.sessionType] : undefined,
    formatDate(review.createdAt, 'monthYearShort'),
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <View className="gap-1.5 rounded-xl bg-surface p-3.5">
      <View className="flex-row items-center justify-between gap-2">
        <Stars value={Math.round(review.rating)} />
        <Text className="shrink text-label text-fg-muted">{meta}</Text>
      </View>
      {review.comment ? <Text className="text-body-sm text-fg">{review.comment}</Text> : null}
    </View>
  )
}

function ProfileSkeleton() {
  return (
    <View accessibilityLabel="Yükleniyor" className="items-center gap-4">
      <Skeleton variant="circle" width={112} height={112} />
      <Skeleton width="60%" height={30} borderRadius="xs" delay={120} />
      <Skeleton height={76} borderRadius="xl" delay={240} />
      <Skeleton height={120} borderRadius="xl" delay={360} />
    </View>
  )
}

/** Uzman profili (tasarım: b0_Uzman_profili). Danışan "davet" sheet'i müşteri kararıyla yok. */
export function ExpertProfileScreen({ expertId, offerId }: ExpertProfileScreenProps) {
  const router = useRouter()
  const colors = useThemeColors()
  const [showMore, setShowMore] = useState(false)
  const role = useAuthStore((s) => s.role)
  const userId = useAuthStore((s) => s.user?.id)

  const access = useExpertProfileAccess(expertId)
  const reviewsQuery = useExpertReviewsQuery(access.state === 'visible' ? expertId : '')
  const { isRefreshing, onRefresh } = useRefresh(
    { refetch: async () => access.refetch() },
    reviewsQuery
  )

  const isOwn = role === 'expert' && userId === expertId
  const expert = access.expert
  const reviews = reviewsQuery.data ?? []
  const showAgree = role === 'client' && Boolean(offerId)

  const topBar = (
    <View className="flex-row items-center justify-between">
      <IconButton accessibilityLabel="Geri" icon="ChevronLeft" onPress={() => router.back()} />
      {isOwn ? (
        <View className="rounded-full bg-accent-soft px-3 py-1.5">
          <Text className="font-body-bold text-label text-accent-soft-fg">
            Danışanların gördüğü profilin
          </Text>
        </View>
      ) : null}
    </View>
  )

  if (access.state !== 'visible' || !expert) {
    return (
      <Screen testID="screen-expert-profile">
        {topBar}
        {access.state === 'loading' ? <ProfileSkeleton /> : null}
        {access.state === 'notVisible' ? (
          <EmptyState
            icon="EyeOff"
            title="Bu profil görüntülenemiyor"
            description="Uzman profillerini yalnız ilanına teklif veren ya da seni davet eden uzmanlar için görebilirsin."
            ctaLabel="Geri dön"
            onCta={() => router.back()}
          />
        ) : null}
        {access.state === 'error' ? (
          <ErrorBanner
            title="Profil yüklenemedi"
            description="Bağlantını kontrol edip tekrar dene."
            onRetry={access.refetch}
          />
        ) : null}
      </Screen>
    )
  }

  const name = getFullName(expert) || 'Uzman'
  const hasDetails = Boolean(
    expert.education || expert.certificates?.length || expert.cvUrl || expert.personalWebsite
  )

  return (
    <Screen
      testID="screen-expert-profile"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      footer={
        showAgree && offerId ? (
          <Button
            label="Bu uzmanla anlaştım"
            size="lg"
            fullWidth
            onPress={() => router.push(`/offer/${offerId}`)}
          />
        ) : undefined
      }
      contentClassName="gap-4"
    >
      <EnterUp>{topBar}</EnterUp>

      {isOwn && expert.status === 'pending' ? (
        <EnterUp>
          <Text className="rounded-xl border border-dashed border-border-strong px-4 py-3.5 text-body-sm text-fg-muted">
            Profilin onay bekliyor. Onaylanınca danışanlar seni bu şekilde görecek.
          </Text>
        </EnterUp>
      ) : null}

      <EnterUp index={1} className="items-center gap-2.5">
        <View className="h-28 w-28 items-center justify-center">
          <View className="absolute -inset-2" pointerEvents="none">
            <Orbit duration={12000}>
              <View className="h-32 w-32 rounded-full border border-dashed border-accent-line" />
            </Orbit>
          </View>
          <Pop>
            <Avatar
              size="hero"
              tone="accent"
              src={expert.avatarUrl ?? undefined}
              initials={expert.initials ?? getInitials(expert)}
            />
          </Pop>
          {expert.isVerified ? (
            <View className="absolute bottom-1 right-0 rounded-full border-[3px] border-bg">
              <VerifiedBadge size={28} delay={400} accessibilityLabel="Doğrulanmış" />
            </View>
          ) : null}
        </View>
        <Text
          accessibilityRole="header"
          className="mt-1 text-center font-display text-3xl tracking-tight text-fg"
        >
          {name}
        </Text>
        <Text className="text-body text-fg-muted">{expert.title}</Text>
      </EnterUp>

      <EnterUp index={2} className="flex-row overflow-hidden rounded-card bg-surface">
        {[
          {
            value: expert.reviewCount > 0 ? expert.rating.toFixed(1).replace('.', ',') : '—',
            label: 'Puan',
          },
          { value: String(expert.reviewCount), label: 'Değerlendirme' },
          { value: `${expert.experienceYears} yıl`, label: 'Deneyim' },
        ].map((stat, i) => (
          <View
            key={stat.label}
            className={cn('flex-1 items-center gap-0.5 p-3.5', i < 2 && 'border-r border-border')}
          >
            <Text className="font-display-bold text-2xl text-fg">{stat.value}</Text>
            <Text className="text-xs text-fg-muted">{stat.label}</Text>
          </View>
        ))}
      </EnterUp>

      {expert.specializations.length > 0 ? (
        <EnterUp index={3} className="flex-row flex-wrap gap-1.5">
          {expert.specializations.map((spec) => (
            <TagChip key={spec} label={spec} tone="accent" />
          ))}
        </EnterUp>
      ) : null}

      <EnterUp index={4} className="gap-2">
        <Text variant="title" accessibilityRole="header">
          Hakkında
        </Text>
        <Text className="text-body leading-6 text-fg-muted">{expert.bio}</Text>
        {showMore ? (
          <FadeIn className="gap-1.5">
            {expert.education ? (
              <Text className="text-body-sm text-fg">
                <Text className="font-body-bold">Eğitim:</Text> {expert.education}
              </Text>
            ) : null}
            {expert.certificates?.length ? (
              <Text className="text-body-sm text-fg">
                <Text className="font-body-bold">Sertifikalar:</Text>{' '}
                {expert.certificates.join(' · ')}
              </Text>
            ) : null}
            <View className="flex-row flex-wrap items-center gap-3">
              {expert.cvUrl ? (
                <View className="flex-row items-center gap-1.5">
                  <Icon name="FileText" size={16} color={colors.text} />
                  <Text className="font-body-semibold text-body-sm text-fg">CV mevcut</Text>
                </View>
              ) : null}
              {expert.personalWebsite ? (
                <Text
                  accessibilityRole="link"
                  onPress={() => {
                    if (expert.personalWebsite) void Linking.openURL(expert.personalWebsite)
                  }}
                  className="font-body-bold text-body-sm text-link"
                >
                  {expert.personalWebsite.replace(/^https?:\/\//, '')}
                </Text>
              ) : null}
            </View>
          </FadeIn>
        ) : null}
        {hasDetails ? (
          <Button
            variant="link"
            label={showMore ? 'Daha az göster' : 'Eğitim ve belgeler'}
            onPress={() => setShowMore((v) => !v)}
            className="self-start px-0"
          />
        ) : null}
      </EnterUp>

      <EnterUp index={5} className="gap-2.5">
        <Text variant="title" accessibilityRole="header">
          Değerlendirmeler
        </Text>
        {reviewsQuery.isLoading ? (
          <Skeleton height={80} borderRadius="xl" />
        ) : reviews.length === 0 ? (
          <Text className="text-body-sm text-fg-muted">Henüz değerlendirme yok.</Text>
        ) : (
          reviews.map((review) => <ReviewItem key={review.id} review={review} />)
        )}
      </EnterUp>
    </Screen>
  )
}
