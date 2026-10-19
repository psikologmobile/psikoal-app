import { View } from 'react-native'

import { Spin } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type SpinnerProps = {
  /** Çap (px), varsayılan 18. */
  size?: number
  /** Halka rengi className'i, varsayılan primary-fg (primary düğme üstünde). */
  colorClassName?: string
  className?: string
  accessibilityLabel?: string
}

/** `spin`: yükleme halkası (0,8 sn ∞). Sağ kenarı saydam 3 px çizgi. */
export function Spinner({
  size = 18,
  colorClassName = 'border-primary-fg',
  className,
  accessibilityLabel = 'Yükleniyor',
}: SpinnerProps) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      className={className}
    >
      <Spin>
        {/* REASON: çap prop'tan gelir */}
        <View
          style={{ width: size, height: size }}
          className={cn('rounded-full border-3 border-r-transparent', colorClassName)}
        />
      </Spin>
    </View>
  )
}
