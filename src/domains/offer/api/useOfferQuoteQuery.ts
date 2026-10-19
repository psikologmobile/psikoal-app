import { useQuery } from '@tanstack/react-query'

import { offerKeys, OFFER_QUOTE_STALE_TIME } from '../offer.constants'
import { OfferQuoteResponseSchema } from '../schemas/offer.schema'

import { get } from '@/lib/api'

/**
 * GET /offers/quote?listingId= — uzmanın bu ilana ŞU AN ödeyeceği ücret ve
 * bakiyesine etkisi. Bir sonraki düşüşün zamanı/tutarı bilerek dönmez.
 * Gönderimde `feeKurus` → `expectedFeeKurus` olarak geri yollanır.
 */
export function useOfferQuoteQuery(listingId: string | undefined) {
  return useQuery({
    queryKey: offerKeys.quote(listingId ?? ''),
    queryFn: async () =>
      OfferQuoteResponseSchema.parse(await get('/offers/quote', { params: { listingId } })).data,
    staleTime: OFFER_QUOTE_STALE_TIME,
    enabled: Boolean(listingId),
  })
}
