import { View } from 'react-native'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { Jiggle } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type ReadonlyFieldProps = {
  label: string
  value: string
  /** Neden değiştirilemediği ("Giriş kimliğin olduğu için değiştirilemez."). */
  hint?: string
  className?: string
}

/**
 * ReadonlyField — kilitli alan: kesikli border-strong çizgi, text-muted yazı,
 * kilit ikonu (1 sn sonra 2 kez sallanır). Kişisel bilgiler · e-posta.
 */
export function ReadonlyField({ label, value, hint, className }: ReadonlyFieldProps) {
  const colors = useThemeColors()
  return (
    <View className={cn('gap-1.5', className)}>
      <Text className="font-body-bold text-label text-fg">{label}</Text>
      <View
        accessible
        accessibilityLabel={`${label}: ${value}, değiştirilemez`}
        className="h-input flex-row items-center justify-between rounded-md border border-dashed border-border-strong px-3.5"
      >
        <Text numberOfLines={1} className="flex-1 font-body-semibold text-body text-fg-muted">
          {value}
        </Text>
        <Jiggle>
          <Icon name="Lock" size={16} color={colors.textMuted} strokeWidth={2.2} />
        </Jiggle>
      </View>
      {hint ? <Text className="text-xs text-fg-muted">{hint}</Text> : null}
    </View>
  )
}
