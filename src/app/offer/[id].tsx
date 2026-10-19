import { useLocalSearchParams } from 'expo-router'

import { useAuthStore } from '@/domains/auth'
import { ClientOfferDetailScreen, ExpertOfferDetailScreen } from '@/screens/offer'

/** /offer/[id] — rol ayrımı: danışan (G2) · uzman (G3). */
export default function OfferDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const role = useAuthStore((s) => s.role)
  const offerId = id ?? ''
  return role === 'expert' ? (
    <ExpertOfferDetailScreen offerId={offerId} />
  ) : (
    <ClientOfferDetailScreen offerId={offerId} />
  )
}
