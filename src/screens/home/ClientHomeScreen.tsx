import { ScrollView, View } from 'react-native'

import { useRouter } from 'expo-router'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Avatar } from '@/core/components/atoms/Avatar'
import { CountBadge } from '@/core/components/atoms/CountBadge'
import { Icon } from '@/core/components/atoms/Icon'
import { IconButton } from '@/core/components/atoms/IconButton'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { ReminderBanner } from '@/core/components/molecules/ReminderBanner'
import { SectionHeader } from '@/core/components/molecules/SectionHeader'
import { HeroCard } from '@/core/components/organisms/HeroCard'
import { Screen } from '@/core/components/templates'
import { useRefresh } from '@/core/hooks'
import { Bell, EnterRight, EnterUp, Float, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'
import { getInitials } from '@/core/utils/personName'
import {
  RESULT_LEVEL_LABELS,
  TestCard,
  useMyAssessmentResultsQuery,
  usePlayableAssessments,
} from '@/domains/assessment'
import { useAuthStore, useReferrerQuery } from '@/domains/auth'
import { BlogCarousel, useBlogListQuery } from '@/domains/blog'
import { useCategoriesQuery } from '@/domains/category'
import {
  ActiveListingCard,
  firstClaimReminder,
  LISTING_MAX_ACTIVE,
  listingQuotaNote,
  pickActiveListing,
  useDismissClaimMutation,
  useListingRulesQuery,
  useMyListingsQuery,
} from '@/domains/listing'
import { useUnreadNotificationCount } from '@/domains/notification'
import { sortOffers, useListingOffersQuery } from '@/domains/offer'

function HomeSkeleton() {
  return (
    <View accessibilityLabel="Yükleniyor" className="gap-3.5">
      <Skeleton height={120} borderRadius="2xl" />
      <Skeleton width={160} height={22} borderRadius="xs" delay={120} />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Skeleton height={130} borderRadius="2xl" delay={240} />
        </View>
        <View className="flex-1">
          <Skeleton height={130} borderRadius="2xl" delay={360} />
        </View>
      </View>
      <Skeleton width={280} height={40} borderRadius="full" delay={480} />
    </View>
  )
}

/** Danışan · Keşfet (tasarım: b0_Danışan_Keşfet). */
export function ClientHomeScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const user = useAuthStore((s) => s.user)
  const unreadCount = useUnreadNotificationCount()

  const myListingsQuery = useMyListingsQuery()
  const rulesQuery = useListingRulesQuery()
  const referrerQuery = useReferrerQuery()
  const categoriesQuery = useCategoriesQuery()
  const assessmentsQuery = usePlayableAssessments()
  const myResultsQuery = useMyAssessmentResultsQuery()
  const blogsQuery = useBlogListQuery({ limit: 5 })
  const { mutate: dismissClaim } = useDismissClaimMutation()

  const listings = myListingsQuery.data?.data ?? []
  const activeCount = myListingsQuery.data?.meta.activeCount ?? 0
  const maxActive = rulesQuery.data?.maxActive ?? LISTING_MAX_ACTIVE
  const reminder = firstClaimReminder(listings)
  const activeListing = pickActiveListing(listings)
  const isFirstTime = myListingsQuery.isSuccess && (myListingsQuery.data.meta.total ?? 0) === 0

  const offersQuery = useListingOffersQuery(activeListing?.id ?? '')
  const activeOffers = sortOffers(offersQuery.data?.data ?? [], 'newest')
  const lastOffer = activeOffers[0]

  const referrer = referrerQuery.data
  const results = myResultsQuery.data?.data ?? []
  const tests = assessmentsQuery.data
  const categories = categoriesQuery.data ?? []

  const { isRefreshing, onRefresh } = useRefresh(
    myListingsQuery,
    referrerQuery,
    categoriesQuery,
    assessmentsQuery,
    myResultsQuery,
    blogsQuery
  )

  const goNewListing = () => router.push('/listing/new')
  const firstName = user?.firstName ?? ''

  return (
    <Screen
      testID="screen-home-client"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      contentClassName="gap-[18px]"
    >
      <EnterUp className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Avatar
            size="md"
            tone="accent"
            src={user?.avatarUrl ?? undefined}
            initials={firstName.charAt(0) || getInitials(user)}
          />
          <View>
            <Text variant="bodySm" color="muted">
              Merhaba,
            </Text>
            <Text className="font-display-bold text-[22px] leading-6 text-fg">{firstName}</Text>
          </View>
        </View>
        <IconButton
          accessibilityLabel={
            unreadCount > 0 ? `Bildirimler, ${unreadCount} okunmamış` : 'Bildirimler'
          }
          onPress={() => router.push('/notifications')}
          size="lg"
          badge={unreadCount > 0 ? <CountBadge count={unreadCount} popDelay={1000} ring /> : null}
        >
          <Bell>
            <Icon name="Bell" size={22} color={colors.text} />
          </Bell>
        </IconButton>
      </EnterUp>

      <EnterUp index={1}>
        <HeroCard
          eyebrow="Bugün"
          title="Nasıl bir destek arıyorsun?"
          actionLabel="Yeni ilan aç"
          onAction={goNewListing}
          note={myListingsQuery.isSuccess ? listingQuotaNote(activeCount, maxActive) : undefined}
        />
      </EnterUp>

      {referrer ? (
        <EnterUp index={2}>
          <PressableScale
            onPress={() => router.push(`/expert/${referrer.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Seni davet eden uzman: ${referrer.name}`}
            testID="referrer-card"
            className="flex-row items-center gap-3.5 rounded-2xl border border-border bg-surface p-4"
          >
            <Avatar
              size="lg"
              tone="primary"
              src={referrer.avatarUrl ?? undefined}
              initials={referrer.initials ?? undefined}
              isVerified
            />
            <View className="flex-1 gap-0.5">
              <Text variant="overline" color="link">
                Seni davet eden uzman
              </Text>
              <Text className="font-body-bold text-base text-fg">{referrer.name}</Text>
              <Text className="text-label text-fg-muted">{referrer.title}</Text>
            </View>
            <Icon name="ChevronRight" size={20} color={colors.textMuted} />
          </PressableScale>
        </EnterUp>
      ) : null}

      {myListingsQuery.isLoading ? <HomeSkeleton /> : null}

      {myListingsQuery.isError ? (
        <ErrorBanner
          title="Bağlantı kurulamadı"
          description="İnternetini kontrol edip tekrar dene."
          icon="WifiOff"
          retryLabel="Tekrar dene"
          onRetry={() => void myListingsQuery.refetch()}
        />
      ) : null}

      {reminder ? (
        <EnterUp index={2}>
          <ReminderBanner
            primaryLabel="İlanıma git"
            onPrimary={() => router.push(`/listing/${reminder.listing.id}`)}
            secondaryLabel="Anlaşmadım"
            onSecondary={() =>
              dismissClaim({ listingId: reminder.listing.id, expertId: reminder.claim.expertId })
            }
          >
            <Text className="text-body leading-[22px] text-accent-soft-fg">
              <Text className="font-body-bold">{reminder.claim.expertName}</Text> seninle
              anlaştığını bildirdi. Anlaştıysan ilanını eşleşti olarak işaretle.
            </Text>
          </ReminderBanner>
        </EnterUp>
      ) : null}

      {activeListing ? (
        <EnterUp index={3} className="gap-2.5">
          <SectionHeader
            title="Aktif ilanın"
            actionLabel="Tümü"
            onAction={() => router.push('/(tabs)/offers')}
          />
          <ActiveListingCard
            listing={activeListing}
            experts={activeOffers.map((offer) => ({
              initials: offer.expert?.initials ?? undefined,
              src: offer.expert?.avatarUrl ?? undefined,
            }))}
            lastOfferLabel={
              lastOffer?.createdAtRelative ? `Son teklif ${lastOffer.createdAtRelative}` : undefined
            }
            onPress={() => router.push(`/listing/${activeListing.id}`)}
          />
        </EnterUp>
      ) : null}

      {isFirstTime ? (
        <EnterUp index={2}>
          <PressableScale
            onPress={goNewListing}
            accessibilityRole="button"
            accessibilityLabel="Henüz ilanın yok. İlk ilanını aç."
            className="flex-row items-center gap-3.5 rounded-2xl border border-dashed border-border-strong p-5"
          >
            <Float>
              <View className="h-14 w-14 items-center justify-center rounded-xl bg-accent-soft">
                <Icon name="SquarePlus" size={26} color={colors.onAccentSoft} />
              </View>
            </Float>
            <View className="flex-1 gap-1">
              <Text className="font-body-bold text-base text-fg">Henüz ilanın yok</Text>
              <Text variant="bodySm" color="muted">
                İlk ilanını aç, uzmanlar sana tekliflerini göndersin.
              </Text>
            </View>
          </PressableScale>
        </EnterUp>
      ) : null}

      {!myListingsQuery.isLoading && !myListingsQuery.isError ? (
        <>
          {tests && tests.length > 0 ? (
            <EnterUp index={4} className="gap-2.5">
              <SectionHeader
                title="Ücretsiz testler"
                actionLabel="Sonuçlarım"
                onAction={() => router.push('/assessment/list')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5"
                contentContainerClassName="gap-3 px-5"
              >
                {tests.map((test, i) => {
                  const last = results.find((r) => r.assessmentId === test.id)
                  return (
                    <EnterRight key={test.id} index={i} delay={240}>
                      <TestCard
                        test={test}
                        variant="tile"
                        highlight={i === 0}
                        lastLevel={last ? RESULT_LEVEL_LABELS[last.level] : undefined}
                        onPress={() => router.push('/assessment')}
                      />
                    </EnterRight>
                  )
                })}
              </ScrollView>
            </EnterUp>
          ) : null}

          {blogsQuery.isLoading || (blogsQuery.data?.data.length ?? 0) > 0 ? (
            <EnterUp index={5} className="gap-2.5">
              <SectionHeader
                title="Yazılar"
                actionLabel="Tümü"
                onAction={() => router.push('/blog')}
              />
              <BlogCarousel
                blogs={blogsQuery.data?.data ?? []}
                isLoading={blogsQuery.isLoading}
                onPressBlog={(slug) => router.push(`/blog/${slug}`)}
              />
            </EnterUp>
          ) : null}

          {categories.length > 0 ? (
            <EnterUp index={6} className="gap-2.5">
              <SectionHeader
                title="Konular"
                actionLabel="Yazılar"
                onAction={() => router.push('/blog')}
              />
              <View testID="category-list" className="flex-row flex-wrap gap-2">
                {categories.map((category, i) => (
                  <PressableScale
                    key={category.id}
                    testID={`category-item-${category.slug}`}
                    onPress={() => router.push(`/category/${category.slug}`)}
                    accessibilityRole="button"
                    accessibilityLabel={category.name}
                    className={cn(
                      'min-h-touch justify-center rounded-full px-4',
                      i === 0 ? 'bg-accent-soft' : 'border border-border-strong'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-body-semibold text-body',
                        i === 0 ? 'text-accent-soft-fg' : 'text-fg'
                      )}
                    >
                      {category.name}
                    </Text>
                  </PressableScale>
                ))}
              </View>
            </EnterUp>
          ) : null}
        </>
      ) : null}
    </Screen>
  )
}
