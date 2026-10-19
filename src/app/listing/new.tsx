import { useLocalSearchParams } from 'expo-router'

import { CreateListingScreen } from '@/screens/listing'
import { AppWebShell } from '@/screens/shell'

export default function NewListingRoute() {
  const { spec } = useLocalSearchParams<{ spec?: string }>()
  return (
    <AppWebShell>
      <CreateListingScreen initialSpecialization={spec || undefined} />
    </AppWebShell>
  )
}
