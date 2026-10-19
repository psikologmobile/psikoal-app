import { View } from 'react-native'

import { Fill } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type ProgressSegmentsProps = {
  /** Parça sayısı (3–7). */
  total: number
  /** Dolu parça sayısı. */
  current: number
  /** bar: 6 px çubuklar (adım) · thin: 5 px (şifre gücü) · dots: nokta (şifre akışı) */
  variant?: 'bar' | 'thin' | 'dots'
  /** Dolgu rengi className'i. */
  fillClassName?: string
  accessibilityLabel?: string
  className?: string
}

/**
 * ProgressSegments — 3–7 parça, her biri soldan dolar (`fill`, 500 ms, sıralı).
 * Karşılama, Kayıt, İlan oluştur, Onboarding.
 */
export function ProgressSegments({
  total,
  current,
  variant = 'bar',
  fillClassName = 'bg-primary',
  accessibilityLabel,
  className,
}: ProgressSegmentsProps) {
  const items = Array.from({ length: Math.max(1, total) })
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? `Adım ${Math.min(current, total)} / ${total}`}
      accessibilityValue={{ min: 0, max: total, now: Math.min(current, total) }}
      className={cn('flex-row items-center', variant === 'dots' ? 'gap-1.5' : 'gap-1', className)}
    >
      {items.map((_, i) => {
        const on = i < current
        if (variant === 'dots') {
          return (
            <View
              key={i}
              className={cn('h-2 rounded-full', on ? cn('w-5', fillClassName) : 'w-2 bg-border')}
            />
          )
        }
        return (
          <View
            key={i}
            className={cn(
              'flex-1 overflow-hidden bg-border',
              variant === 'thin' ? 'h-[5px] rounded-[3px]' : 'h-1.5 rounded-[3px]'
            )}
          >
            <Fill value={on ? 1 : 0} className={fillClassName} duration={500} delay={i * 60} />
          </View>
        )
      })}
    </View>
  )
}
