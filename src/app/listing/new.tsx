import { useLocalSearchParams } from 'expo-router'

import { CreateListingScreen } from '@/screens/listing'

export default function NewListingRoute() {
  const { spec } = useLocalSearchParams<{ spec?: string }>()
  return <CreateListingScreen initialSpecialization={spec || undefined} />
}
