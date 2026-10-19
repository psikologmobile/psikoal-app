import { useMutation, useQueryClient } from '@tanstack/react-query'

import { listingKeys } from '../listing.constants'
import { ListingSchema } from '../schemas/listing.schema'

import type { CreateListingRequest } from '../types/listing.types'

import { authKeys } from '@/domains/auth'
import { post } from '@/lib/api'

/**
 * POST /listings. Hatalar ekranda satır içinde: 422 CONTACT_CONSENT_REQUIRED,
 * PHONE_REQUIRED, LISTING_BUDGET_OUT_OF_RANGE (bkz. LISTING_ERROR_CODES).
 * Yanıt eski biçimde kaldı: zarfsız ListingDto.
 */
export function useCreateListingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { suppressErrorAlert: true },
    mutationFn: async (data: CreateListingRequest) =>
      ListingSchema.parse(await post('/listings', data)),
    onSuccess: (_listing, request) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.my() })
      // Formda verilen telefon sunucuda profile yazılır.
      if (request.phone) queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
  })
}
