import { useState } from 'react'

import { ScrollView, View } from 'react-native'

import { useRouter } from 'expo-router'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { FilterChip } from '@/core/components/atoms/FilterChip'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { Screen } from '@/core/components/templates'
import { useRefresh } from '@/core/hooks'
import { EnterUp } from '@/core/motion'
import { BlogCard, useBlogListQuery } from '@/domains/blog'
import { useCategoriesQuery } from '@/domains/category'

/** Yazılar (tasarım: b0_Blog): kategori süzgeci, öne çıkan yazı, satır kartları. */
export function BlogFeedScreen() {
  const router = useRouter()
  const [category, setCategory] = useState<string | undefined>(undefined)
  const categoriesQuery = useCategoriesQuery()
  const blogsQuery = useBlogListQuery(category ? { category } : {})
  const { isRefreshing, onRefresh } = useRefresh(blogsQuery, categoriesQuery)

  const blogs = blogsQuery.data?.data ?? []
  const [featured, ...rest] = blogs
  const categories = categoriesQuery.data ?? []

  return (
    <Screen
      testID="screen-blog"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      contentClassName="gap-4"
    >
      <EnterUp>
        <ScreenHeader title="Yazılar" onBack={() => router.back()} />
      </EnterUp>

      {categories.length > 0 ? (
        <EnterUp index={1}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-5"
            contentContainerClassName="gap-2 px-5"
          >
            <FilterChip
              label="Tümü"
              selected={category === undefined}
              onPress={() => setCategory(undefined)}
            />
            {categories.map((item) => (
              <FilterChip
                key={item.id}
                label={item.name}
                selected={category === item.blogTag}
                onPress={() => setCategory(item.blogTag)}
              />
            ))}
          </ScrollView>
        </EnterUp>
      ) : null}

      {blogsQuery.isLoading ? (
        <View accessibilityLabel="Yükleniyor" className="gap-3">
          <Skeleton height={260} borderRadius="3xl" />
          <Skeleton height={96} borderRadius="xl" delay={150} />
          <Skeleton height={96} borderRadius="xl" delay={300} />
        </View>
      ) : blogsQuery.isError ? (
        <ErrorBanner
          title="Yazılar yüklenemedi"
          description="Bağlantını kontrol edip tekrar dene."
          onRetry={() => void blogsQuery.refetch()}
        />
      ) : !featured ? (
        <EnterUp className="items-center gap-2 px-5 py-15">
          <Text className="font-body-bold text-lg text-fg">Bu konuda henüz yazı yok</Text>
          <Text variant="bodySm" color="muted">
            Yakında yeni yazılar eklenecek.
          </Text>
        </EnterUp>
      ) : (
        <>
          <EnterUp index={2}>
            <BlogCard
              blog={featured}
              variant="feature"
              onPress={() => router.push(`/blog/${featured.slug}`)}
            />
          </EnterUp>
          {rest.map((blog, i) => (
            <EnterUp key={blog.id} index={Math.min(7, i + 3)}>
              <BlogCard blog={blog} onPress={() => router.push(`/blog/${blog.slug}`)} />
            </EnterUp>
          ))}
        </>
      )}
    </Screen>
  )
}
