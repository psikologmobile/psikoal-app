import { useLocalSearchParams } from 'expo-router'

import { ExpertProfileScreen } from '@/screens/expert'
import { AppWebShell } from '@/screens/shell'

/** /expert/[id]?offerId= — uzman profili (danışan, kendi profili, onay bekliyor). */
export default function ExpertProfileRoute() {
  const { id, offerId } = useLocalSearchParams<{ id: string; offerId?: string }>()
  return (
    <AppWebShell>
      <ExpertProfileScreen expertId={id ?? ''} offerId={offerId || undefined} />
    </AppWebShell>
  )
}
