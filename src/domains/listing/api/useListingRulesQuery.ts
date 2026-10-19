import { useQuery } from '@tanstack/react-query'

import { listingKeys, LISTING_RULES_STALE_TIME } from '../listing.constants'
import { ListingRulesResponseSchema } from '../schemas/listing.schema'

import { get } from '@/lib/api'

/**
 * GET /listings/rules — ilan formunun dönemsel kuralları (bütçe aralığı, başlık ve
 * açıklama sınırları, şehir zorunluluğu, en çok aktif ilan). Form şeması
 * `createListingSchemaFor(rules)` ile kurulur.
 */
export function useListingRulesQuery() {
  return useQuery({
    queryKey: listingKeys.rules(),
    queryFn: async () => ListingRulesResponseSchema.parse(await get('/listings/rules')).data,
    staleTime: LISTING_RULES_STALE_TIME,
  })
}
