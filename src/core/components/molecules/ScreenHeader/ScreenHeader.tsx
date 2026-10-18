import type { ReactNode } from 'react'

import { View } from 'react-native'

import { useRouter } from 'expo-router'

import type { IconName } from '@/core/components/atoms/Icon'

import { IconButton } from '@/core/components/atoms/IconButton'
import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

export type ScreenHeaderProps = {
  title: string
  /** Üst satırda küçük soluk metin ("Merhaba," / "Adım 2"). */
  eyebrow?: string
  /** Geri düğmesi: 'back' (‹) · 'close' (×) · 'none'. */
  leading?: 'back' | 'close' | 'none'
  onBack?: () => void
  /** Sağ taraf: durum rozeti veya IconButton. */
  right?: ReactNode
  /** sub: alt sayfa (26) · tab: sekme sayfası (34, geri yok) */
  size?: 'sub' | 'tab'
  className?: string
}

const LEADING_ICON: Record<'back' | 'close', IconName> = { back: 'ChevronLeft', close: 'X' }

/**
 * ScreenHeader — 44 px outline geri dairesi + başlık (display 26–34) + sağda
 * durum/eylem. Güvenli alan boşluğunu ekran verir (SafeAreaView / pt-safe).
 */
export function ScreenHeader({
  title,
  eyebrow,
  leading = 'back',
  onBack,
  right,
  size = 'sub',
  className,
}: ScreenHeaderProps) {
  const router = useRouter()
  const showLeading = size === 'sub' && leading !== 'none'
  return (
    <View className={cn('flex-row items-center gap-3', className)}>
      {showLeading ? (
        <IconButton
          icon={LEADING_ICON[leading === 'close' ? 'close' : 'back']}
          accessibilityLabel={leading === 'close' ? 'Kapat' : 'Geri'}
          onPress={onBack ?? (() => router.back())}
        />
      ) : null}
      <View className="flex-1">
        {eyebrow ? <Text className="text-body-sm text-fg-muted">{eyebrow}</Text> : null}
        <Text
          accessibilityRole="header"
          numberOfLines={2}
          className={cn(
            'font-display text-fg',
            size === 'tab' ? 'text-h2' : 'text-[26px] leading-[30px]'
          )}
        >
          {title}
        </Text>
      </View>
      {right}
    </View>
  )
}
