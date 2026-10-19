import { useState } from 'react'

import { useMarkMatchedMutation } from '../api/useMarkMatchedMutation'

import { getErrorMessage } from '@/lib/api'

/** Onay sheet'inde gösterilen uzman ve eşleşilecek teklif. */
export type MatchTarget = {
  offerId: string
  expertName: string
  expertInitials?: string
}

type UseMatchConfirmParams = {
  listingId: string | undefined
  /** Eşleşme oluşunca (ör. kutlama ekranına geç). */
  onMatched: (matchId: string) => void
}

type UseMatchConfirmReturn = {
  target: MatchTarget | null
  ask: (target: MatchTarget) => void
  cancel: () => void
  confirm: () => void
  isPending: boolean
  errorMessage: string | undefined
}

/**
 * "Bu uzmanla anlaştım" akışı (Revize 2 §3.4): onay sheet'i durumu +
 * POST /listings/{id}/match. Kabul/ret yok; ilan eşleşti olarak işaretlenir.
 */
export function useMatchConfirm({
  listingId,
  onMatched,
}: UseMatchConfirmParams): UseMatchConfirmReturn {
  const [target, setTarget] = useState<MatchTarget | null>(null)
  const { mutate, isPending, error, reset } = useMarkMatchedMutation()

  const ask = (next: MatchTarget) => {
    reset()
    setTarget(next)
  }

  const cancel = () => {
    if (isPending) return
    setTarget(null)
  }

  const confirm = () => {
    if (!listingId || !target) return
    mutate(
      { listingId, offerId: target.offerId },
      {
        onSuccess: ({ matchId }) => {
          setTarget(null)
          onMatched(matchId)
        },
      }
    )
  }

  return {
    target,
    ask,
    cancel,
    confirm,
    isPending,
    errorMessage: error ? getErrorMessage(error) : undefined,
  }
}
