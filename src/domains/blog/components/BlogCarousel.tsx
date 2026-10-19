import { ScrollView, View } from 'react-native'

import { BlogCover } from './BlogCover'

import type { BlogListItem } from '../types/blog.types'

import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EnterRight, PressableScale } from '@/core/motion'

export type BlogCarouselProps = {
  blogs: BlogListItem[]
  isLoading?: boolean
  onPressBlog: (slug: string) => void
}

/** Keşfet · yatay yazı kartları (geometrik kapak + başlık). */
export function BlogCarousel({ blogs, isLoading = false, onPressBlog }: BlogCarouselProps) {
  if (isLoading) {
    return (
      <View className="flex-row gap-3">
        <Skeleton width={220} height={180} borderRadius="2xl" />
        <Skeleton width={220} height={180} borderRadius="2xl" delay={150} />
      </View>
    )
  }
  if (blogs.length === 0) return null
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3"
      className="-mx-5"
      contentContainerStyle={{ paddingHorizontal: 20 }}
    >
      {blogs.map((blog, i) => (
        <EnterRight key={blog.id} index={i}>
          <PressableScale
            onPress={() => onPressBlog(blog.slug)}
            accessibilityRole="button"
            accessibilityLabel={`${blog.title}, ${blog.readingTime} dakika okuma`}
            className="w-[220px] overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <BlogCover
              imageUrl={blog.coverImage}
              size="card"
              seed={blog.slug}
              className="h-[110px]"
            />
            <View className="gap-1 p-3.5">
              <Text className="font-body-bold text-xs text-link">{blog.readingTime} dk okuma</Text>
              <Text className="font-body-bold text-body leading-5 text-fg" numberOfLines={2}>
                {blog.title}
              </Text>
            </View>
          </PressableScale>
        </EnterRight>
      ))}
    </ScrollView>
  )
}
