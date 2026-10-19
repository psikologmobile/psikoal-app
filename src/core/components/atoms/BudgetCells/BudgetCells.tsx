import { View } from 'react-native'

import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import { useAnimatedProgress } from '@/core/motion'
import { cn } from '@/core/utils/cn'

type CellProps = { on: boolean; index: number }

function Cell({ on, index }: CellProps) {
  // cell-rise: scaleY .2→1 yerine yükseklik %40 → %100 (400 ms)
  const h = useAnimatedProgress(on ? 1 : 0.4, { duration: 400, delay: index * 20 })
  const style = useAnimatedStyle(() => ({ height: `${h.value * 100}%`, width: '100%' }))
  return (
    <View className="h-full flex-1 justify-end">
      <Animated.View style={style}>
        <View className={cn('flex-1 rounded-xs', on ? 'bg-primary' : 'bg-border-strong')} />
      </Animated.View>
    </View>
  )
}

export type BudgetCellsProps = {
  /** Sütun sayısı, varsayılan 8. */
  count?: number
  /** Seçili aralık (dahil, 0 tabanlı). */
  from: number
  to: number
  className?: string
}

/**
 * BudgetCells — 8 sütun; seçili aralık yükselir (`cell-rise`). Görsel gösterge:
 * seçim düğmeleri (ön ayar) ayrı çizilir. İlan oluştur · bütçe.
 */
export function BudgetCells({ count = 8, from, to, className }: BudgetCellsProps) {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('h-[70px] flex-row items-end gap-1', className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Cell key={i} index={i} on={i >= lo && i <= hi} />
      ))}
    </View>
  )
}
