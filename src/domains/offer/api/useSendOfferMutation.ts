import { useMutation, useQueryClient } from '@tanstack/react-query'

import { offerKeys } from '../offer.constants'
import { OfferSchema } from '../schemas/offer.schema'
import { isOfferFeeChangedError } from '../utils/offerErrors'

import type { SendOfferPayload } from '../types/offer.types'

import { listingKeys } from '@/domains/listing'
import { isInsufficientBalanceError, walletKeys } from '@/domains/wallet'
import { post } from '@/lib/api'

/**
 * POST /offers { ...form, expectedFeeKurus }. Başarı yanıtı teklif + danışanın
 * iletişim bilgisi (clientContact). Hatalar ekranda satır içinde gösterilir —
 * dallanma için `parseSendOfferError` / `isOfferFeeChangedError` /
 * `isInsufficientBalanceError` kullanılır.
 */
export function useSendOfferMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { suppressErrorAlert: true },
    mutationFn: async (payload: SendOfferPayload) =>
      OfferSchema.parse(await post('/offers', payload)),
    onSuccess: (offer) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.my() })
      queryClient.invalidateQueries({ queryKey: offerKeys.quote(offer.listingId) })
      queryClient.invalidateQueries({ queryKey: listingKeys.all })
      // Teklif ücret ya da hak düşürür: bakiye ve defter bayatladı.
      queryClient.invalidateQueries({ queryKey: walletKeys.all })
    },
    onError: (error, payload) => {
      // 409 OFFER_FEE_CHANGED: ekrandaki teklif ücreti eskidi → yeni ücret çekilsin,
      // uzman onaylayıp tekrar göndersin. 422 INSUFFICIENT_BALANCE: bakiye eskiyse tazelensin.
      if (isOfferFeeChangedError(error) || isInsufficientBalanceError(error)) {
        queryClient.invalidateQueries({ queryKey: offerKeys.quote(payload.listingId) })
        queryClient.invalidateQueries({ queryKey: walletKeys.me() })
      }
    },
  })
}
