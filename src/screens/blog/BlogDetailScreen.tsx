import { View } from 'react-native'

import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'

import { Avatar } from '@/core/components/atoms/Avatar'
import { IconButton } from '@/core/components/atoms/IconButton'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { EnterUp } from '@/core/motion'
import { formatDate } from '@/core/utils/formatDate'
import { BlogCover, BlogLikeButton, useBlogDetailQuery } from '@/domains/blog'

type BlogDetailScreenProps = {
  slug: string
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => part && !part.endsWith('.'))
    .slice(-2)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr-TR'))
    .join('')
}

/** Yazı detayı (tasarım: b0_Blog_detayı): okuma ilerleme çubuğu, kapak, beğen çubuğu. */
export function BlogDetailScreen({ slug }: BlogDetailScreenProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const blogQuery = useBlogDetailQuery(slug)
  const blog = blogQuery.data

  // Okuma ilerlemesi: kaydırılan oran (0..1), UI iş parçacığında.
  const progress = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((event) => {
    const max = event.contentSize.height - event.layoutMeasurement.height
    progress.value = max > 0 ? Math.min(1, Math.max(0, event.contentOffset.y / max)) : 1
  })
  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%`, height: '100%' }))

  const back = (
    <View
      // REASON: geri düğmesi güvenli alanın altına, kapağın üstüne oturur
      style={{ top: insets.top + 12 }}
      className="absolute left-5 z-10 rounded-full bg-bg"
    >
      <IconButton
        accessibilityLabel="Geri"
        icon="ChevronLeft"
        variant="ghost"
        onPress={() => router.back()}
      />
    </View>
  )

  if (blogQuery.isLoading) {
    return (
      <View testID="screen-blog-detail" className="flex-1 bg-bg">
        {back}
        <Skeleton height={300} borderRadius="none" />
        <View accessibilityLabel="Yükleniyor" className="gap-3 p-[22px]">
          <Skeleton width="40%" height={14} borderRadius="xs" />
          <Skeleton width="85%" height={32} borderRadius="xs" delay={120} />
          <Skeleton height={120} borderRadius="md" delay={240} />
        </View>
      </View>
    )
  }

  if (blogQuery.isError || !blog) {
    return (
      <View
        testID="screen-blog-detail"
        // REASON: üst boşluk cihazın güvenli alanından
        style={{ paddingTop: insets.top + 72 }}
        className="flex-1 bg-bg px-5"
      >
        {back}
        <EmptyState
          icon="FileX"
          title="Yazı bulunamadı"
          description="İçerik kaldırılmış olabilir. Lütfen daha sonra tekrar dene."
          ctaLabel="Geri dön"
          onCta={() => router.back()}
        />
      </View>
    )
  }

  const paragraphs = (blog.content ?? blog.excerpt).split(/\n{2,}/).filter((p) => p.trim())
  const category = blog.categories[0]

  return (
    <View testID="screen-blog-detail" className="flex-1 bg-bg">
      <View
        // REASON: ilerleme çubuğu güvenli alanın hemen altında
        style={{ top: insets.top }}
        className="absolute inset-x-0 z-20 h-1 bg-border"
        accessibilityElementsHidden
      >
        <Animated.View style={barStyle}>
          <View className="flex-1 bg-primary" />
        </Animated.View>
      </View>
      {back}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <EnterUp>
          <BlogCover imageUrl={blog.coverImage} size="hero" seed={blog.slug} />
        </EnterUp>
        <View className="w-full gap-3.5 self-center p-[22px] web:max-w-[760px]">
          <EnterUp index={1} className="flex-row items-center gap-1.5">
            {category ? (
              <View className="rounded-full bg-accent-soft px-2.5 py-1">
                <Text variant="badge" className="text-accent-soft-fg">
                  {category}
                </Text>
              </View>
            ) : null}
            <Text className="text-label text-fg-muted">
              {blog.readingTime} dk okuma · {formatDate(blog.publishedAt, 'long')}
            </Text>
          </EnterUp>
          <EnterUp index={2}>
            <Text
              accessibilityRole="header"
              className="font-display text-[32px] leading-[35px] tracking-tight text-fg"
            >
              {blog.title}
            </Text>
          </EnterUp>
          <EnterUp index={3} className="flex-row items-center gap-2.5">
            <Avatar size="sm" tone="accent" initials={initialsOf(blog.author.name)} />
            <View>
              <Text className="font-body-bold text-body-sm text-fg">{blog.author.name}</Text>
              <Text className="text-xs text-fg-muted">{blog.author.title}</Text>
            </View>
          </EnterUp>
          {paragraphs.map((paragraph, i) => {
            const heading = paragraph.match(/^#{1,3}\s+(.*)$/)
            return (
              <EnterUp key={i} index={Math.min(5, i + 4)}>
                {heading ? (
                  <Text
                    accessibilityRole="header"
                    className="mt-1.5 font-display-bold text-[21px] leading-7 text-fg"
                  >
                    {heading[1]}
                  </Text>
                ) : (
                  <Text
                    className={
                      i === 0
                        ? 'text-base leading-[26px] text-fg'
                        : 'text-base leading-[26px] text-fg-muted'
                    }
                  >
                    {paragraph.trim()}
                  </Text>
                )}
              </EnterUp>
            )
          })}
        </View>
      </Animated.ScrollView>

      <View
        // REASON: alt çubuk güvenli alanın üstünde yüzer
        style={{ bottom: Math.max(20, insets.bottom + 8) }}
        className="absolute inset-x-3"
      >
        <EnterUp delay={500} offset={90}>
          <View className="h-[68px] flex-row items-center justify-between rounded-2xl border border-border bg-surface pl-4.5 pr-2.5">
            <Text className="font-body-semibold text-body-sm text-fg-muted">
              Bu yazı işine yaradı mı?
            </Text>
            <BlogLikeButton
              slug={blog.slug}
              liked={blog.liked}
              likeCount={blog.likeCount}
              variant="pill"
            />
          </View>
        </EnterUp>
      </View>
    </View>
  )
}
