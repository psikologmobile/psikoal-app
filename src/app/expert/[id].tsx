import { useLocalSearchParams } from 'expo-router'

import { ExpertProfileScreen } from '@/screens/expert'

/** /expert/[id]?offerId= — uzman profili (danışan, kendi profili, onay bekliyor). */
export default function ExpertProfileRoute() {
  const { id, offerId } = useLocalSearchParams<{ id: string; offerId?: string }>()
  return <ExpertProfileScreen expertId={id ?? ''} offerId={offerId || undefined} />
}
