import { View } from 'react-native'

import { useBlogLike } from '../hooks/useBlogLike'

import { Text } from '@/core/components/atoms/Text'
import { HeartBurst, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type BlogLikeButtonProps = {
  slug: string
  liked: boolean
  likeCount: number
  /** icon: liste satırı (48 kare, sayı altta) · pill: detay alt çubuğu (dolgu değişir) */
  variant?: 'icon' | 'pill'
}

/** Beğen düğmesi — `heart` + `burst` (kalp büyür, halka yayılır). */
export function BlogLikeButton({
  slug,
  liked: initialLiked,
  likeCount: initialCount,
  variant = 'icon',
}: BlogLikeButtonProps) {
  const colors = useThemeColors()
  const { liked, likeCount, toggleLike } = useBlogLike({
    slug,
    liked: initialLiked,
    likeCount: initialCount,
  })

  if (variant === 'pill') {
    return (
      <PressableScale
        onPress={toggleLike}
        haptics="light"
        accessibilityRole="button"
        accessibilityState={{ selected: liked }}
        accessibilityLabel={liked ? `Beğeniyi geri al, ${likeCount}` : `Beğen, ${likeCount}`}
        className={cn(
          'h-12 flex-row items-center gap-2 rounded-md px-4',
          liked ? 'bg-primary' : 'bg-bg'
        )}
      >
        <HeartBurst
          liked={liked}
          size={20}
          color={liked ? colors.onPrimary : colors.primary}
          idleColor={colors.text}
        />
        <Text className={cn('font-body-bold text-body', liked ? 'text-primary-fg' : 'text-fg')}>
          {likeCount}
        </Text>
      </PressableScale>
    )
  }

  return (
    <PressableScale
      onPress={toggleLike}
      haptics="light"
      accessibilityRole="button"
      accessibilityState={{ selected: liked }}
      accessibilityLabel={liked ? `Beğeniyi geri al, ${likeCount}` : `Beğen, ${likeCount}`}
      className="h-12 w-12 items-center justify-center gap-px rounded-md"
    >
      <HeartBurst liked={liked} size={20} color={colors.primary} idleColor={colors.text} />
      <View>
        <Text className="font-body-bold text-[11px] text-fg">{likeCount}</Text>
      </View>
    </PressableScale>
  )
}
