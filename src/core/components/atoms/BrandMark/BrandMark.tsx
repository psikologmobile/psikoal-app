import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

// Uygulamanın TEK marka işareti. Gerçek logo geldiğinde yalnız bu dosya
// değişir; giriş, karşılama, web kenar çubuğu bu bileşeni kullanır.
export const BRAND_NAME = 'PsikoAl'

export type BrandMarkSize = 'sm' | 'md'

export type BrandMarkProps = {
  size?: BrandMarkSize
  /**
   * Ekran okuyucuya başlık olarak bildirilsin mi (varsayılan evet). Web sitesinin üst
   * menüsünde logo bir bağlantının içindedir; sayfanın tek h1'i sayfa başlığı olmalı.
   */
  asHeader?: boolean
  /** Yalnız simge (web ikon rayı). */
  iconOnly?: boolean
  className?: string
}

const textStyles: Record<BrandMarkSize, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
}

/**
 * v2 logo: text renginde 4 px halka + üzerine binen primary disk + "PsikoAl"
 * (Bricolage 800). Web sidebar: 38×28 simge + 22 px yazı.
 */
export function BrandMark({
  size = 'md',
  iconOnly = false,
  asHeader = true,
  className,
}: BrandMarkProps) {
  const ring = size === 'sm' ? 'h-6 w-6 border-[3px]' : 'h-7 w-7 border-4'
  const disc = size === 'sm' ? 'left-[10px] h-6 w-[22px]' : 'left-3 h-7 w-[26px]'
  return (
    <View
      accessible
      accessibilityRole={asHeader ? 'header' : undefined}
      accessibilityLabel={BRAND_NAME}
      className={cn('flex-row items-center gap-2.5 self-center', className)}
    >
      <View className={cn('relative', size === 'sm' ? 'h-6 w-8' : 'h-7 w-[38px]')}>
        <View className={cn('absolute left-0 top-0 rounded-full border-fg', ring)} />
        <View className={cn('absolute top-0 rounded-full bg-primary', disc)} />
      </View>
      {iconOnly ? null : (
        <Text className={cn('font-display text-fg', textStyles[size])}>{BRAND_NAME}</Text>
      )}
    </View>
  )
}
