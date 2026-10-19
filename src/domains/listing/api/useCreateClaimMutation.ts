import { useMutation, useQueryClient } from '@tanstack/react-query'

import { listingKeys } from '../listing.constants'
import { ClaimResponseSchema, CreateClaimSchema } from '../schemas/listing.schema'

import type { CreateClaimRequest } from '../types/listing.types'

import { offerKeys } from '@/domains/offer'
import { post } from '@/lib/api'

type CreateClaimVariables = CreateClaimRequest & { listingId: string }

/**
 * POST /listings/{id}/claims { note? } — uzmanın "Danışanla anlaştım" bildirimi
 * (Revize 2 §3.5). İlan başına bir kez: 409 CLAIM_ALREADY_EXISTS; teklif yoksa ya
 * da ilan açık değilse 422 CLAIM_NOT_ALLOWED. Hata ekranda satır içinde gösterilir.
 */
export function useCreateClaimMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { suppressErrorAlert: true },
    mutationFn: async ({ listingId, ...request }: CreateClaimVariables) => {
      const body = CreateClaimSchema.parse(request)
      return ClaimResponseSchema.parse(await post(`/listings/${listingId}/claims`, body)).data
    },
    onSuccess: (claim) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(claim.listingId) })
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() })
      // Teklif yanıtındaki `claimed` bayrağı da değişti.
      queryClient.invalidateQueries({ queryKey: offerKeys.all })
    },
  })
}
