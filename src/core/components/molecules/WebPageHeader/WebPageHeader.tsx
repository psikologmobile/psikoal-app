import type { ReactNode } from 'react'

import { Pressable, View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { EnterUp } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type WebPageHeaderProps = {
  title: string
  /** Üstte geri bağlantısı ("← İlanlarım"). */
  backLabel?: string
  onBack?: () => void
  /** Başlık üstü soluk selam ("Merhaba, Zeynep"). */
  greeting?: string
  /** Başlık üstü öğe (durum hapı, "Davet edildin" rozeti). */
  eyebrow?: ReactNode
  /** Başlık altı soluk açıklama. */
  subtitle?: ReactNode
  /** Sağda eylem (birincil düğme, "İlanı kapat"). */
  right?: ReactNode
  /** Başlık boyu: lg 40 · md 38 · sm 36 (tasarım). */
  size?: 'lg' | 'md' | 'sm'
  testID?: string
}

const titleSize = {
  lg: 'text-[40px] leading-[44px]',
  md: 'text-[38px] leading-[42px]',
  sm: 'text-[36px] leading-[40px]',
} as const

/**
 * WebPageHeader — web uygulaması sayfa başlığı (tasarım: b1_Web_* `header`):
 * geri bağlantısı + display başlık (-0.02em) + sağda eylem; dar ekranda sarar.
 */
export function WebPageHeader({
  title,
  backLabel,
  onBack,
  greeting,
  eyebrow,
  subtitle,
  right,
  size = 'lg',
  testID,
}: WebPageHeaderProps) {
  return (
    <EnterUp>
      <View testID={testID} className="flex-row flex-wrap items-end justify-between gap-4">
        <View className="min-w-0 shrink gap-2">
          {backLabel && onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="link"
              accessibilityLabel={`Geri: ${backLabel}`}
              className="self-start rounded-xs"
            >
              <Text className="font-body-semibold text-body-sm text-link">← {backLabel}</Text>
            </Pressable>
          ) : null}
          {eyebrow ? (
            <View className="flex-row flex-wrap items-center gap-2">{eyebrow}</View>
          ) : null}
          <View>
            {greeting ? <Text className="text-body text-fg-muted">{greeting}</Text> : null}
            <Text
              accessibilityRole="header"
              className={cn('max-w-[780px] font-display tracking-tight text-fg', titleSize[size])}
            >
              {title}
            </Text>
          </View>
          {typeof subtitle === 'string' ? (
            <Text className="text-body text-fg-muted">{subtitle}</Text>
          ) : (
            (subtitle ?? null)
          )}
        </View>
        {right ? <View className="flex-row flex-wrap items-center gap-2.5">{right}</View> : null}
      </View>
    </EnterUp>
  )
}
