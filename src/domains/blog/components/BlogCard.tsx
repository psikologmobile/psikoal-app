import { View } from 'react-native'

import { BlogCover } from './BlogCover'
import { BlogLikeButton } from './BlogLikeButton'

import type { BlogListItem } from '../types/blog.types'

import { Text } from '@/core/components/atoms/Text'
import { PressableScale } from '@/core/motion'
import { hoverLift } from '@/core/theme'
import { formatDate } from '@/core/utils/formatDate'

export type BlogCardProps = {
  blog: BlogListItem
  onPress: () => void
  /** feature: büyük kapaklı ilk yazı · row: küçük kapak + beğen */
  variant?: 'feature' | 'row'
}

/** BlogCard — düz geometrik kapak, kategori, okuma süresi, başlık, beğeni. */
export function BlogCard({ blog, onPress, variant = 'row' }: BlogCardProps) {
  const category = blog.categories[0]
  const date = formatDate(blog.publishedAt, 'dayMonthShort')

  if (variant === 'feature') {
    return (
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${blog.title}, ${blog.readingTime} dakika okuma`}
        className={`overflow-hidden rounded-panel bg-surface ${hoverLift}`}
      >
        <BlogCover imageUrl={blog.coverImage} size="card" seed={blog.slug} />
        <View className="gap-2 p-4">
          <View className="flex-row items-center gap-1.5">
            {category ? (
              <View className="rounded-full bg-accent-soft px-2.5 py-1">
                <Text variant="badge" className="text-accent-soft-fg">
                  {category}
                </Text>
              </View>
            ) : null}
            <Text className="text-label text-fg-muted">{blog.readingTime} dk okuma</Text>
          </View>
          <Text className="font-display text-[22px] leading-[26px] text-fg">{blog.title}</Text>
          <Text variant="bodySm" color="muted" numberOfLines={3}>
            {blog.excerpt}
          </Text>
          <Text className="text-label text-fg-muted">
            {blog.author.name} · {date}
          </Text>
        </View>
      </PressableScale>
    )
  }

  return (
    <View className="flex-row items-center gap-3.5 rounded-card border border-border p-3">
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${blog.title}, ${blog.readingTime} dakika okuma`}
        wrapperClassName="min-w-0 flex-1"
        className="flex-row items-center gap-3.5"
      >
        <BlogCover imageUrl={blog.coverImage} size="thumb" seed={blog.slug} />
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-body-bold text-xs text-link">
            {category ? `${category} · ` : ''}
            {blog.readingTime} dk
          </Text>
          <Text className="font-body-bold text-body leading-5 text-fg" numberOfLines={2}>
            {blog.title}
          </Text>
          <Text className="text-xs text-fg-muted">{date}</Text>
        </View>
      </PressableScale>
      <BlogLikeButton slug={blog.slug} liked={blog.liked} likeCount={blog.likeCount} />
    </View>
  )
}
