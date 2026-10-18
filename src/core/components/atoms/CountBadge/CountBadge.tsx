import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { Pop } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type CountBadgeProps = {
  count: number
  /** Üst sınır; aşılınca "9+" gösterilir. */
  max?: number
  /** Gecikmeli pop (ms). Zil rozeti tasarımda 1000. */
  popDelay?: number
  /** 2 px bg halka (bir ikonun üstüne oturuyorsa). */
  ring?: boolean
  className?: string
}

/** CountBadge — primary dolgu, 22 px, 2 px bg halka, gecikmeli pop. Zil, sekme. */
export function CountBadge({
  count,
  max = 99,
  popDelay = 0,
  ring = true,
  className,
}: CountBadgeProps) {
  if (count <= 0) return null
  const text = count > max ? `${max}+` : String(count)
  return (
    <Pop delay={popDelay} replayKey={text}>
      <View
        accessibilityRole="text"
        accessibilityLabel={`${count} okunmamış`}
        className={cn(
          'h-[22px] min-w-[22px] items-center justify-center rounded-full bg-primary px-1.5',
          ring && 'border-2 border-bg',
          className
        )}
      >
        <Text className="font-body-heavy text-badge text-primary-fg">{text}</Text>
      </View>
    </Pop>
  )
}
