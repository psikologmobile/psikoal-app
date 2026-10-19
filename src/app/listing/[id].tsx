import { useLocalSearchParams } from 'expo-router'

import { useAuthStore } from '@/domains/auth'
import { ClientListingDetailScreen, ExpertListingDetailScreen } from '@/screens/listing'

/** /listing/[id] — rol ayrımı: danışan (G2) · uzman (G3). */
export default function ListingDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const role = useAuthStore((s) => s.role)
  const listingId = id ?? ''
  return role === 'expert' ? (
    <ExpertListingDetailScreen listingId={listingId} />
  ) : (
    <ClientListingDetailScreen listingId={listingId} />
  )
}
