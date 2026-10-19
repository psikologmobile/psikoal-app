import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

export type SiteHeadingProps = {
  kicker: string
  title: string
  /** accent: koyu/vurgulu zemin üstünde (Güven bölümü). */
  tone?: 'default' | 'accent'
  /** h1 olarak işaretlensin mi (sayfanın ana başlığı değilse h2). */
  level?: 1 | 2
  className?: string
}

/** Bölüm başlığı: büyük harf "kick" + Bricolage 44 (≤960 px 36) başlık. */
export function SiteHeading({
  kicker,
  title,
  tone = 'default',
  level = 2,
  className,
}: SiteHeadingProps) {
  return (
    <View className={cn('gap-2.5', className)}>
      <Text
        className={cn(
          'font-body-heavy text-label uppercase tracking-[1.3px]',
          tone === 'accent' ? 'text-accent-muted' : 'text-primary-text'
        )}
      >
        {kicker}
      </Text>
      <Text
        role="heading"
        aria-level={level}
        className={cn(
          'font-display text-[36px] leading-[38px] tracking-[-0.7px] min-[961px]:text-[44px] min-[961px]:leading-[46px]',
          tone === 'accent' ? 'text-accent-fg' : 'text-fg'
        )}
      >
        {title}
      </Text>
    </View>
  )
}
