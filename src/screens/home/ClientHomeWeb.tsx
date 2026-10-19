import { View } from 'react-native'

import type { AssessmentListItem, MyAssessmentResult } from '@/domains/assessment'
import type { BlogListItem } from '@/domains/blog'
import type { Category } from '@/domains/category'
import type { Listing } from '@/domains/listing'

import { Button } from '@/core/components/atoms/Button'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { SectionHeader } from '@/core/components/molecules/SectionHeader'
import { WebPageHeader } from '@/core/components/molecules/WebPageHeader'
import { HeroCard } from '@/core/components/organisms/HeroCard'
import { WebColumns, WebGrid } from '@/core/components/templates'
import { EnterUp, PressableScale, Wobble } from '@/core/motion'
import { hoverLift } from '@/core/theme'
import { cn } from '@/core/utils/cn'
import { RESULT_LEVEL_LABELS, TestCard } from '@/domains/assessment'
import { BlogCard } from '@/domains/blog'
import { AdCard } from '@/domains/listing'

export type ClientHomeWebProps = {
  firstName: string
  isWide: boolean
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  reminder: { expertName: string; onGo: () => void; onDismiss: () => void } | null
  quotaNote?: string
  /** Yayında + onay bekleyen ilanlar. */
  listings: Listing[]
  isFirstTime: boolean
  tests: AssessmentListItem[]
  results: MyAssessmentResult[]
  blogs: BlogListItem[]
  categories: Category[]
  referrer: { name: string; title?: string | null; onPress: () => void } | null
  onNewListing: () => void
  onListing: (id: string) => void
  onAllListings: () => void
  onTest: () => void
  onResults: () => void
  onBlog: (slug: string) => void
  onAllBlogs: () => void
  onCategory: (slug: string) => void
}

/**
 * Danışan · Keşfet — web/tablet yerleşimi (tasarım: b1_Web_Keşfet, b1_Tablet_Keşfet).
 * 8/4 ızgara; ≤1100 px sütunlar alt alta. Veri ve eylemler ClientHomeScreen'den gelir.
 */
export function ClientHomeWeb(props: ClientHomeWebProps) {
  const { reminder, listings, isWide } = props

  const main = (
    <>
      {reminder ? (
        <EnterUp index={1}>
          <View className="relative gap-3.5 overflow-hidden rounded-4xl bg-accent p-[30px]">
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              className="absolute -right-[60px] -top-[60px]"
            >
              <Wobble style={{ transformOrigin: '100% 0%' }}>
                <View className="h-[240px] w-[240px] rounded-bl-[240px] bg-accent-line" />
              </Wobble>
            </View>
            <Text variant="overline" className="text-label text-accent-muted">
              Hatırlatma
            </Text>
            <Text
              accessibilityRole="header"
              className="max-w-[520px] font-display text-[30px] leading-[33px] text-accent-fg"
            >
              {reminder.expertName} seninle anlaştığını bildirdi.
            </Text>
            <Text className="max-w-[520px] text-base text-accent-muted">
              Anlaştıysan ilanını eşleşti olarak işaretle.
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              <Button label="İlanıma git" onPress={reminder.onGo} />
              <Button label="Anlaşmadım" variant="outline" onPress={reminder.onDismiss} />
            </View>
          </View>
        </EnterUp>
      ) : (
        <EnterUp index={1}>
          <HeroCard
            eyebrow="Bugün"
            title="Nasıl bir destek arıyorsun?"
            actionLabel="Yeni ilan aç"
            onAction={props.onNewListing}
            note={props.quotaNote}
          />
        </EnterUp>
      )}

      {props.isLoading ? (
        <View accessibilityLabel="Yükleniyor" className="gap-4">
          <Skeleton width={180} height={24} borderRadius="xs" />
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Skeleton height={150} borderRadius="2xl" delay={120} />
            </View>
            <View className="flex-1">
              <Skeleton height={150} borderRadius="2xl" delay={240} />
            </View>
          </View>
        </View>
      ) : null}

      {props.isError ? (
        <ErrorBanner
          title="Bağlantı kurulamadı"
          description="İnternetini kontrol edip tekrar dene."
          icon="WifiOff"
          retryLabel="Tekrar dene"
          onRetry={props.onRetry}
        />
      ) : null}

      {listings.length > 0 ? (
        <EnterUp index={2} className="gap-3">
          <SectionHeader
            title="Aktif ilanların"
            actionLabel="Tümü"
            onAction={props.onAllListings}
          />
          <WebGrid columns={2}>
            {listings.map((listing) => (
              <AdCard
                key={listing.id}
                listing={listing}
                onPress={() => props.onListing(listing.id)}
                className="flex-1"
              />
            ))}
          </WebGrid>
        </EnterUp>
      ) : null}

      {props.isFirstTime ? (
        <EnterUp index={2}>
          <PressableScale
            onPress={props.onNewListing}
            accessibilityRole="button"
            accessibilityLabel="Henüz ilanın yok. İlk ilanını aç."
            className={cn(
              'gap-1 rounded-2xl border border-dashed border-border-strong p-5',
              hoverLift
            )}
          >
            <Text className="font-body-bold text-base text-fg">Henüz ilanın yok</Text>
            <Text variant="bodySm" color="muted">
              İlk ilanını aç, uzmanlar sana tekliflerini göndersin.
            </Text>
          </PressableScale>
        </EnterUp>
      ) : null}

      {props.blogs.length > 0 ? (
        <EnterUp index={4} className="gap-3">
          <SectionHeader
            title="Son yazılar"
            actionLabel="Tüm yazılar"
            onAction={props.onAllBlogs}
          />
          <WebGrid columns={isWide ? 3 : 2}>
            {props.blogs.slice(0, isWide ? 3 : 4).map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                variant="feature"
                onPress={() => props.onBlog(blog.slug)}
              />
            ))}
          </WebGrid>
        </EnterUp>
      ) : null}
    </>
  )

  const lastResult = props.results[0]
  const aside = (
    <>
      {props.referrer ? (
        <EnterUp index={2}>
          <PressableScale
            onPress={props.referrer.onPress}
            accessibilityRole="button"
            accessibilityLabel={`Seni davet eden uzman: ${props.referrer.name}`}
            className={cn('gap-0.5 rounded-3xl border border-border bg-surface p-5', hoverLift)}
          >
            <Text variant="overline" color="link">
              Seni davet eden uzman
            </Text>
            <Text className="font-body-bold text-base text-fg">{props.referrer.name}</Text>
            {props.referrer.title ? (
              <Text className="text-label text-fg-muted">{props.referrer.title}</Text>
            ) : null}
          </PressableScale>
        </EnterUp>
      ) : null}

      {props.tests.length > 0 ? (
        <EnterUp index={2} className="gap-3 rounded-3xl border border-border p-5">
          <SectionHeader
            title="Ücretsiz testler"
            actionLabel="Sonuçlarım"
            onAction={props.onResults}
          />
          {lastResult ? (
            <View className="flex-row items-center justify-between rounded-lg bg-accent-soft p-3.5">
              <View>
                <Text className="font-body-semibold text-xs text-accent-soft-fg">Son sonuç</Text>
                <Text className="font-body-bold text-base text-accent-soft-fg">
                  {lastResult.assessmentTitle}
                </Text>
              </View>
              <View className="rounded-full bg-primary px-3 py-1.5">
                <Text className="font-body-heavy text-body-sm text-primary-fg">
                  {RESULT_LEVEL_LABELS[lastResult.level]}
                </Text>
              </View>
            </View>
          ) : null}
          {props.tests.map((test) => (
            <TestCard key={test.id} test={test} variant="compact" onPress={props.onTest} />
          ))}
        </EnterUp>
      ) : null}

      {props.categories.length > 0 ? (
        <EnterUp index={3} className="gap-3 rounded-3xl border border-border p-5">
          <Text variant="title" accessibilityRole="header">
            Konular
          </Text>
          <View testID="category-list" className="flex-row flex-wrap gap-2">
            {props.categories.map((category, i) => (
              <PressableScale
                key={category.id}
                testID={`category-item-${category.slug}`}
                onPress={() => props.onCategory(category.slug)}
                accessibilityRole="link"
                accessibilityLabel={category.name}
                className={cn(
                  'min-h-touch justify-center rounded-full px-3.5',
                  i === 0 ? 'bg-accent-soft' : 'border border-border-strong',
                  'web:transition-colors web:hover:border-accent-line'
                )}
              >
                <Text
                  className={cn(
                    'text-body-sm',
                    i === 0 ? 'font-body-bold text-accent-soft-fg' : 'font-body-semibold text-fg'
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
  )

  return (
    <>
      <WebPageHeader
        greeting={props.firstName ? `Merhaba, ${props.firstName}` : undefined}
        title="Bugün ne yapmak istersin?"
        right={<Button label="Yeni ilan aç" icon="Plus" size="lg" onPress={props.onNewListing} />}
      />
      <WebColumns aside={aside} asideWidth={360} testID="home-web-columns">
        {main}
      </WebColumns>
    </>
  )
}
