import { useMutation, useQueryClient } from '@tanstack/react-query'

import { offerKeys } from '../offer.constants'
import { OfferSchema } from '../schemas/offer.schema'

import { post } from '@/lib/api'

export function useWithdrawOfferMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    // Hata geri çek sheet'inde satır içinde gösterilir.
    meta: { suppressErrorAlert: true },
    mutationFn: async (offerId: string) => {
      const raw = await post(`/offers/${offerId}/withdraw`, {})
      return OfferSchema.parse(raw)
    },
    onSuccess: (_offer, offerId) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.detail(offerId) })
      queryClient.invalidateQueries({ queryKey: offerKeys.my() })
    },
  })
}
