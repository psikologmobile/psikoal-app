import { useMutation, useQueryClient } from '@tanstack/react-query'

import { listingKeys } from '../listing.constants'
import { MarkMatchedResponseSchema } from '../schemas/listing.schema'

import { matchKeys } from '@/domains/match'
import { notificationKeys } from '@/domains/notification'
import { offerKeys } from '@/domains/offer'
import { post } from '@/lib/api'

type MarkMatchedVariables = {
  listingId: string
  /** Danışanın eşleştiği uzmanın bu ilandaki PENDING teklifi. */
  offerId: string
}

/**
 * POST /listings/{id}/match { offerId } → { matchId } (Revize 2 §3.4).
 * Danışan ilanını "X uzmanla eşleşti" işaretler; seçilen teklif ACCEPTED, diğerleri
 * REJECTED (OTHER_EXPERT), ilan MATCHED olur. Hepsi sunucuda tek işlemde;
 * optimistic update YAPILMAZ. Hatalar: 409 LISTING_NOT_OPEN, 422 OFFER_NOT_ON_LISTING,
 * 403 LISTING_NOT_OWNER.
 */
export function useMarkMatchedMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ listingId, offerId }: MarkMatchedVariables) =>
      MarkMatchedResponseSchema.parse(await post(`/listings/${listingId}/match`, { offerId })).data,
    onSuccess: (_result, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(listingId) })
      queryClient.invalidateQueries({ queryKey: listingKeys.my() })
      queryClient.invalidateQueries({ queryKey: offerKeys.all })
      queryClient.invalidateQueries({ queryKey: matchKeys.all })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
