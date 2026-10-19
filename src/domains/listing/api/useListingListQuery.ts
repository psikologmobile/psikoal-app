import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { listingKeys, LISTING_STALE_TIME } from '../listing.constants'
import { ListingSchema } from '../schemas/listing.schema'

import type { ListingListFilters, ListingListParams } from '../types/listing.types'

import { get } from '@/lib/api'

const ListingListResponseSchema = z.object({
  data: z.array(ListingSchema),
  meta: z.object({ page: z.number(), total: z.number(), perPage: z.number() }),
})

/**
 * Sorgu parametreleri: boş şehir ve sıralama gönderilmez; `invitedOnly` yalnız
 * true iken gider (sunucu `invitedOnly=true` dışındaki her değeri "hepsi" sayar).
 */
export function toListingListParams(
  { invitedOnly, city, ...filters }: ListingListFilters = {},
  sort?: string
): ListingListParams {
  return {
    ...filters,
    ...(city ? { city } : {}),
    ...(invitedOnly ? { invitedOnly: true as const } : {}),
    ...(sort ? { sort } : {}),
  }
}

/**
 * GET /listings — uzman feed'i. Süzgeç: uzmanlık, görüşme şekli, bütçe, şehir,
 * yalnız davetliler; sıralama: newest · budget_desc · budget_asc · offer_asc · fee_asc.
 */
export function useListingListQuery(filters: ListingListFilters = {}, sort?: string) {
  const params = toListingListParams(filters, sort)
  return useQuery({
    queryKey: listingKeys.lists(params),
    queryFn: async () => {
      const raw = await get('/listings', { params })
      const result = ListingListResponseSchema.safeParse(raw)
      if (!result.success) throw result.error
      return result.data
    },
    staleTime: LISTING_STALE_TIME,
  })
}
