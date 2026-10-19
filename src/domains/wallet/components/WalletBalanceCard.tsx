import { View } from 'react-native'

import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'

export type WalletBalanceCardProps = {
  /** Backend etiketi: "₺1.250". */
  balanceLabel?: string
  /** İkincil satır (ör. "1 ücretsiz teklif hakkı"). */
  caption?: string
  isLoading?: boolean
  onPress: () => void
}

/**
 * Uzman ana sayfasındaki kompakt bakiye kartı. Mobilde yükleme yolu YOK
 * (mağaza kuralı); kart yalnız /wallet ekranını açar.
 */
export function WalletBalanceCard({
  balanceLabel,
  caption,
  isLoading = false,
  onPress,
}: WalletBalanceCardProps) {
  const colors = useThemeColors()

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={balanceLabel ? `Bakiyem, ${balanceLabel}` : 'Bakiyem'}
      testID="wallet-balance-card"
      className="flex-row items-center gap-3 rounded-3xl border border-border bg-surface px-4 py-3"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
        <Icon name="Wallet" size={18} color={colors.primaryText} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="bodySm" color="muted">
          Bakiyem
        </Text>
        {isLoading ? (
          <Skeleton variant="line" width="40%" height={14} />
        ) : (
          <Text variant="title">{balanceLabel ?? '—'}</Text>
        )}
      </View>
      {caption ? (
        <Text variant="bodySm" color="muted">
          {caption}
        </Text>
      ) : null}
      <Icon name="ChevronRight" size={16} color={colors.textMuted} />
    </PressableScale>
  )
}
