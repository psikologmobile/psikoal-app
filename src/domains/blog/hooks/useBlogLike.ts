import { useState } from 'react'

import { useLikeBlogMutation } from '../api/useLikeBlogMutation'

type UseBlogLikeParams = {
  slug: string
  liked: boolean
  likeCount: number
}

type UseBlogLikeReturn = {
  liked: boolean
  likeCount: number
  toggleLike: () => void
}

/**
 * Beğeni anında görünür (iyimser); sunucu yanıtı gelince onun değeri esas
 * alınır, hata olursa önceki değere dönülür.
 */
export function useBlogLike({ slug, liked, likeCount }: UseBlogLikeParams): UseBlogLikeReturn {
  const { mutate: likeBlog, data } = useLikeBlogMutation()
  const [optimistic, setOptimistic] = useState<{ liked: boolean; likeCount: number } | null>(null)

  const current = optimistic ?? {
    liked: data?.liked ?? liked,
    likeCount: data?.likeCount ?? likeCount,
  }

  const toggleLike = () => {
    const next = {
      liked: !current.liked,
      likeCount: Math.max(0, current.likeCount + (current.liked ? -1 : 1)),
    }
    setOptimistic(next)
    likeBlog({ slug }, { onSettled: () => setOptimistic(null) })
  }

  return { ...current, toggleLike }
}
