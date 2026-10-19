import { Children } from 'react'
import type { ReactNode } from 'react'

import { View } from 'react-native'

import { cn } from '@/core/utils/cn'

export type SiteGridProps = {
  children: ReactNode
  /**
   * Hücre genişlik sınıfları (mobil önce), ör. "min-[641px]:w-1/2 min-[961px]:w-1/3".
   * Tailwind taraması için çağıran yerde düz metin olarak yazılır.
   */
  itemClassName: string
  /** Hücreler arası boşluk: md 20 px (varsayılan), sm 12-16 px. */
  gap?: 'sm' | 'md'
  className?: string
}

const GUTTER = {
  md: { row: '-m-2.5', cell: 'p-2.5' },
  sm: { row: '-m-1.5', cell: 'p-1.5' },
} as const

/**
 * Duyarlı ızgara: CSS grid yerine sarılan flex satırı + hücre iç boşluğu (RN web
 * ve native'de aynı çalışır, statik HTML'de medya sorgularıyla).
 */
export function SiteGrid({ children, itemClassName, gap = 'md', className }: SiteGridProps) {
  const gutter = GUTTER[gap]
  return (
    <View className={cn('flex-row flex-wrap', gutter.row, className)}>
      {Children.toArray(children).map((child, index) => (
        <View key={index} className={cn('w-full', gutter.cell, itemClassName)}>
          {child}
        </View>
      ))}
    </View>
  )
}
