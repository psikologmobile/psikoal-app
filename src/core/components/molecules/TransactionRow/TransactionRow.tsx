import { View } from 'react-native'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type TransactionRowProps = {
  /** Artı (yükleme) mı eksi (harcama) mı. Tutar metni backend'den biçimli gelir. */
  direction: 'in' | 'out'
  /** Tür ("Bakiye yükleme", "Teklif ücreti"). */
  title: string
  /** Açıklama (ilan başlığı vb.), tek satır. */
  description?: string
  /** "+₺500" / "−₺125" */
  amount: string
  /** Sonraki bakiye ("Bakiye ₺1.250") ya da tarih. */
  after?: string
  isLast?: boolean
  className?: string
}

/**
 * TransactionRow — tür ikonu (+ accent-soft · − surface), açıklama, tutar
 * (artı primary-text), sonra. Bakiyem (mobil liste).
 */
export function TransactionRow({
  direction,
  title,
  description,
  amount,
  after,
  isLast = false,
  className,
}: TransactionRowProps) {
  const colors = useThemeColors()
  const isIn = direction === 'in'
  return (
    <View
      accessible
      accessibilityLabel={[title, description, amount, after].filter(Boolean).join(', ')}
      className={cn(
        'flex-row items-center gap-3 px-2 py-3',
        !isLast && 'border-b border-border',
        className
      )}
    >
      <View
        className={cn(
          'h-10 w-10 items-center justify-center rounded-sm',
          isIn ? 'bg-accent-soft' : 'bg-surface'
        )}
      >
        <Icon
          name={isIn ? 'ArrowUp' : 'ArrowDown'}
          size={18}
          strokeWidth={2.4}
          color={isIn ? colors.onAccentSoft : colors.text}
        />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-body-bold text-body-sm text-fg">{title}</Text>
        {description ? (
          <Text numberOfLines={1} className="text-xs text-fg-muted">
            {description}
          </Text>
        ) : null}
      </View>
      <View className="items-end gap-0.5">
        <Text className={cn('font-body-bold text-body', isIn ? 'text-primary-text' : 'text-fg')}>
          {amount}
        </Text>
        {after ? <Text className="text-[11px] text-fg-muted">{after}</Text> : null}
      </View>
    </View>
  )
}
