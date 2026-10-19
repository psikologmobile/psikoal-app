import { Children } from 'react'
import type { ReactNode } from 'react'

import { View } from 'react-native'

import { cn } from '@/core/utils/cn'

export type WebGridProps = {
  children: ReactNode
  /** Sütun sayısı (tasarım: `repeat(n, minmax(0,1fr))`). */
  columns: number
  /** Satır ve sütun arası boşluk sınıfı (gap-3 · gap-4 …). */
  gapClassName?: string
  className?: string
  testID?: string
}

/** Öğeleri `columns` genişliğinde satırlara böler; son satır boş hücrelerle doldurulur. */
export function chunkIntoRows<T>(items: T[], columns: number): T[][] {
  const n = Math.max(1, Math.floor(columns))
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += n) rows.push(items.slice(i, i + n))
  return rows
}

/**
 * WebGrid (template) — eşit genişlikli kart ızgarası. CSS grid yerine satır + flex-1
 * hücre kullanır (React Native ve web'de aynı davranır).
 */
export function WebGrid({
  children,
  columns,
  gapClassName = 'gap-4',
  className,
  testID,
}: WebGridProps) {
  const items = Children.toArray(children).filter(Boolean)
  const rows = chunkIntoRows(items, columns)
  const n = Math.max(1, Math.floor(columns))
  return (
    <View testID={testID} className={cn(gapClassName, className)}>
      {rows.map((row, r) => (
        <View key={r} className={cn('flex-row items-stretch', gapClassName)}>
          {row.map((item, c) => (
            <View key={c} className="min-w-0 flex-1">
              {item}
            </View>
          ))}
          {Array.from({ length: n - row.length }, (_, i) => (
            <View key={`pad-${i}`} className="flex-1" />
          ))}
        </View>
      ))}
    </View>
  )
}
