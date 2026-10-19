import type { Offer } from '../types/offer.types'

/** Danışanın ilan detayındaki teklif sıralamaları (hiçbir teklif gizlenmez). */
export type OfferSort = 'newest' | 'fee_asc' | 'rating_desc'

export const OFFER_SORT_OPTIONS: Array<{ value: OfferSort; label: string }> = [
  { value: 'newest', label: 'En yeni' },
  { value: 'fee_asc', label: 'En düşük ücret' },
  { value: 'rating_desc', label: 'En yüksek puan' },
]

const time = (offer: Offer) => new Date(offer.createdAt).getTime()

/** Yeni dizi döner; eşitlikte en yeni önce. */
export function sortOffers(offers: Offer[], sort: OfferSort): Offer[] {
  const byNewest = (a: Offer, b: Offer) => time(b) - time(a)
  return [...offers].sort((a, b) => {
    if (sort === 'fee_asc') return a.price - b.price || byNewest(a, b)
    if (sort === 'rating_desc') {
      return (b.expert?.rating ?? 0) - (a.expert?.rating ?? 0) || byNewest(a, b)
    }
    return byNewest(a, b)
  })
}
