import { View } from 'react-native'

import { useRouter } from 'expo-router'

import type { IconName } from '@/core/components/atoms/Icon'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Button } from '@/core/components/atoms/Button'
import { Icon, isIconName } from '@/core/components/atoms/Icon'
import { IconButton } from '@/core/components/atoms/IconButton'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { StatTile } from '@/core/components/molecules/StatTile'
import { Screen } from '@/core/components/templates'
import { useRefresh } from '@/core/hooks'
import { Breathe, EnterUp, Float, PressableScale, Ring } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { TestCard, usePlayableAssessments } from '@/domains/assessment'
import { useBlogListQuery } from '@/domains/blog'
import { useCategoryDetailQuery } from '@/domains/category'

type CategoryScreenProps = {
  slug: string
}

/** Kategori (tasarım: b0_Kategori): istatistik, açıklama, ilgili testler/yazılar, "Destek al". */
export function CategoryScreen({ slug }: CategoryScreenProps) {
  const router = useRouter()
  const colors = useThemeColors()
  const categoryQuery = useCategoryDetailQuery(slug)
  const category = categoryQuery.data
  const testsQuery = usePlayableAssessments(category?.assessmentCategory ?? undefined)
  const blogsQuery = useBlogListQuery(category ? { category: category.blogTag, limit: 3 } : {})
  const { isRefreshing, onRefresh } = useRefresh(categoryQuery, testsQuery, blogsQuery)

  const back = (
    <IconButton accessibilityLabel="Geri" icon="ChevronLeft" onPress={() => router.back()} />
  )

  if (categoryQuery.isLoading) {
    return (
      <Screen testID="screen-category">
        {back}
        <View accessibilityLabel="Yükleniyor" className="gap-4">
          <Skeleton height={92} borderRadius="3xl" />
          <View className="flex-row gap-2.5">
            <View className="flex-1">
              <Skeleton height={84} borderRadius="xl" delay={120} />
            </View>
            <View className="flex-1">
              <Skeleton height={84} borderRadius="xl" delay={240} />
            </View>
          </View>
          <Skeleton height={96} borderRadius="md" delay={360} />
        </View>
      </Screen>
    )
  }

  if (categoryQuery.isError || !category) {
    return (
      <Screen testID="screen-category">
        {back}
        {categoryQuery.isError ? (
          <ErrorBanner
            title="Konu yüklenemedi"
            description="Bağlantını kontrol edip tekrar dene."
            onRetry={() => void categoryQuery.refetch()}
          />
        ) : (
          <EmptyState
            icon="SearchX"
            title="Konu bulunamadı"
            ctaLabel="Geri dön"
            onCta={() => router.back()}
          />
        )}
      </Screen>
    )
  }

  const tests = testsQuery.data
  const blogs = blogsQuery.data?.data ?? []
  const icon: IconName = isIconName(category.icon) ? category.icon : 'Sparkles'

  return (
    <Screen
      testID="screen-category"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      contentClassName="gap-4"
      footer={
        <Float distance={3} duration={2400}>
          <Button
            label="Destek al"
            size="xl"
            fullWidth
            icon="ArrowRight"
            iconPosition="right"
            onPress={() =>
              router.push({ pathname: '/listing/new', params: { spec: category.name } })
            }
            testID="category-support"
          />
        </Float>
      }
    >
      {back}

      <EnterUp index={1} className="flex-row items-center gap-[18px]">
        <View className="h-[92px] w-[92px] items-center justify-center" accessibilityElementsHidden>
          {[0, 1300].map((delay) => (
            <View key={delay} className="absolute inset-0">
              <Ring
                size={92}
                delay={delay}
                duration={2600}
                from={0.6}
                to={1.7}
                colorClassName="border-accent-line"
              />
            </View>
          ))}
          <Breathe>
            <View className="h-[92px] w-[92px] items-center justify-center rounded-[30px] bg-accent">
              <Icon name={icon} size={40} color={colors.onAccent} />
            </View>
          </Breathe>
        </View>
        <View className="flex-1 gap-1">
          <Text
            accessibilityRole="header"
            className="font-display text-[38px] leading-[40px] tracking-tight text-fg"
          >
            {category.name}
          </Text>
          <Text className="text-body text-fg-muted">{category.summary}</Text>
        </View>
      </EnterUp>

      <EnterUp index={2} className="flex-row gap-2.5">
        <StatTile label="Bu alanda uzman" value={category.expertCount} delay={500} />
        <StatTile label="Tamamlanan eşleşme" value={category.completedMatchCount} delay={650} />
      </EnterUp>

      <EnterUp index={3}>
        <Text className="text-body leading-6 text-fg-muted">{category.description}</Text>
      </EnterUp>

      {tests && tests.length > 0 ? (
        <EnterUp index={4} className="gap-2.5">
          <Text variant="title" accessibilityRole="header">
            İlgili testler
          </Text>
          {tests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              variant="compact"
              onPress={() => router.push('/assessment')}
            />
          ))}
        </EnterUp>
      ) : null}

      <EnterUp index={5} className="gap-2.5">
        <Text variant="title" accessibilityRole="header">
          İlgili yazılar
        </Text>
        {blogsQuery.isLoading ? (
          <Skeleton height={68} borderRadius="xl" />
        ) : blogs.length === 0 ? (
          <Text className="text-body-sm text-fg-muted">Bu konuyla ilgili henüz yazı yok.</Text>
        ) : (
          blogs.map((blog) => (
            <PressableScale
              key={blog.id}
              onPress={() => router.push(`/blog/${blog.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={`${blog.title}, ${blog.readingTime} dakika okuma`}
              className="gap-1 rounded-xl border border-border px-4 py-3.5"
            >
              <Text className="font-body-bold text-xs text-link">{blog.readingTime} dk okuma</Text>
              <Text className="font-body-bold text-body text-fg">{blog.title}</Text>
            </PressableScale>
          ))
        )}
      </EnterUp>
    </Screen>
  )
}
