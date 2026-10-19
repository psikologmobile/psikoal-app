import { useMutation, useQueryClient } from '@tanstack/react-query'

import { listingKeys } from '../listing.constants'
import { ClaimResponseSchema } from '../schemas/listing.schema'

import { notificationKeys } from '@/domains/notification'
import { post } from '@/lib/api'

type DismissClaimVariables = {
  listingId: string
  expertId: string
}

/**
 * POST /listings/{id}/claims/{expertId}/dismiss — danışanın "Anlaşmadım" yanıtı;
 * hatırlatmayı kapatır. Bildirim yoksa 404 CLAIM_NOT_FOUND.
 */
export function useDismissClaimMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ listingId, expertId }: DismissClaimVariables) =>
      ClaimResponseSchema.parse(await post(`/listings/${listingId}/claims/${expertId}/dismiss`, {}))
        .data,
    onSuccess: (_claim, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(listingId) })
      queryClient.invalidateQueries({ queryKey: listingKeys.my() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
