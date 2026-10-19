import { Platform } from 'react-native'

import { Redirect } from 'expo-router'

import { NotFoundScreen } from '@/screens/site'

/** Bilinmeyen adres: web'de 404 sayfası (b2_Site_404), mobilde ana sayfa. */
export default function NotFoundRoute() {
  if (Platform.OS !== 'web') return <Redirect href="/(tabs)" />
  return <NotFoundScreen />
}
