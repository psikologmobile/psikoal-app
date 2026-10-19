import { useCallback, useState } from 'react'

import { ZodError } from 'zod'

import { useCreateReviewMutation } from '../api/useCreateReviewMutation'

import type { CreateReviewRequest } from '../schemas/review.schema'

import { ApiError, getErrorMessage } from '@/lib/api'

export const REVIEW_ALREADY_EXISTS = 'REVIEW_ALREADY_EXISTS'

type UseMatchReviewParams = {
  expertId: string
  matchId: string
  sessionType?: CreateReviewRequest['sessionType']
}

type UseMatchReviewReturn = {
  submit: (rating: number, comment: string) => void
  isSubmitting: boolean
  /** Değerlendirme gönderildi ya da daha önce gönderilmişti — form gizlenir. */
  isDone: boolean
  doneMessage: string | null
  errorMessage: string | null
}

/**
 * API eşleşmenin değerlendirilip değerlendirilmediğini söylemiyor; form her
 * zaman gösterilir ve REVIEW_ALREADY_EXISTS hatası "zaten değerlendirildi"
 * durumuna çevrilir (hata gibi değil, bilgi olarak).
 */
export function useMatchReview({
  expertId,
  matchId,
  sessionType,
}: UseMatchReviewParams): UseMatchReviewReturn {
  const { mutate, isPending } = useCreateReviewMutation()
  const [doneMessage, setDoneMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const submit = useCallback(
    (rating: number, comment: string) => {
      setErrorMessage(null)
      mutate(
        { expertId, review: { matchId, rating, comment, sessionType: sessionType ?? null } },
        {
          onSuccess: () =>
            setDoneMessage('Değerlendirmen alındı, onaylandıktan sonra profilde görünecek.'),
          onError: (error) => {
            if (error instanceof ApiError && error.code === REVIEW_ALREADY_EXISTS) {
              setDoneMessage(error.message)
              return
            }
            // Zod (istemci tarafı doğrulama) hatası: ilk alan mesajını göster.
            const issue = error instanceof ZodError ? error.issues[0]?.message : undefined
            setErrorMessage(issue ?? getErrorMessage(error))
          },
        }
      )
    },
    [expertId, matchId, mutate, sessionType]
  )

  return {
    submit,
    isSubmitting: isPending,
    isDone: doneMessage !== null,
    doneMessage,
    errorMessage,
  }
}
