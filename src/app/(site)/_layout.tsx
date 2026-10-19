import { Platform } from 'react-native'

import { Redirect, Stack } from 'expo-router'

/**
 * Web sitesi sayfaları (tanıtım dışındakiler; `/` (tabs) kapısında). YALNIZ web:
 * mobil uygulama bu adresleri açmaz (bakiye satın alma yolu dahil — mağaza kuralı),
 * uygulamanın ana sayfasına döner.
 */
export default function SiteLayout() {
  if (Platform.OS !== 'web') return <Redirect href="/(tabs)" />
  return <Stack screenOptions={{ headerShown: false }} />
}
