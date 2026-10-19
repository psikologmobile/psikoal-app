import { useMutation, useQueryClient } from '@tanstack/react-query'

import { expertKeys } from '../expert.constants'
import { CreateReviewSchema, ReviewSchema } from '../schemas/review.schema'

import type { CreateReviewRequest } from '../schemas/review.schema'

import { post } from '@/lib/api'

type CreateReviewVariables = {
  expertId: string
  review: CreateReviewRequest
}

/** Danışan eşleşmesindeki uzmanı değerlendirir — eşleşme ACTIVE iken de açık (Revize 2 §5). */
export function useCreateReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    // Hata formda satır içinde gösteriliyor.
    meta: { suppressErrorAlert: true },
    mutationFn: async ({ expertId, review }: CreateReviewVariables) => {
      const body = CreateReviewSchema.parse(review)
      return ReviewSchema.parse(await post(`/experts/${expertId}/reviews`, body))
    },
    onSuccess: (_review, { expertId }) => {
      void queryClient.invalidateQueries({ queryKey: expertKeys.reviews(expertId) })
    },
  })
}
