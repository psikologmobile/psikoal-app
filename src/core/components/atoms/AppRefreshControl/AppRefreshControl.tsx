import { RefreshControl } from 'react-native'
import type { RefreshControlProps } from 'react-native'

import { useThemeColors } from '@/core/theme'

// Android'de ScrollView/FlatList bu elementi KLONLAYIP tüm scroll içeriğini ona
// children olarak geçiriyor (react-native ScrollView.js: cloneElement(refreshControl,
// {style}, <NativeScrollView>…</NativeScrollView>)). Bu yüzden `children` ve `style`
// mutlaka RefreshControl'e iletilmeli — iletilmezse ekranın TÜM içeriği yere düşer,
// hiçbir hata da üretilmez. iOS'ta refreshControl sadece bir çocuk olduğu için
// belirti yalnız Android'de görülür.
export type AppRefreshControlProps = Omit<RefreshControlProps, 'tintColor' | 'colors'>

export function AppRefreshControl({ refreshing, onRefresh, ...rest }: AppRefreshControlProps) {
  const colors = useThemeColors()
  return (
    <RefreshControl
      {...rest}
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
      progressBackgroundColor={colors.surface}
    />
  )
}
