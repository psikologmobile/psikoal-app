import type { ReactNode } from 'react'

import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'

export type FeeFooterProps = {
  /** O anki teklif ücreti — backend etiketi ("₺625"). */
  feeLabel: string | null
  /** Sağdaki eylem (Teklif ver / Teklifini gör / Kilitli). */
  action?: ReactNode
}

/**
 * FeeFooter — ilan kartının altındaki accent-soft şerit: YALNIZ o anki teklif
 * ücreti. Müşteri kararı: düşüş oku (`bob`), kalan süre çubuğu (`drain`) ve
 * "sonraki düşüş" metni çizilmez.
 */
export function FeeFooter({ feeLabel, action }: FeeFooterProps) {
  return (
    <View className="flex-row items-center justify-between gap-2.5 bg-accent-soft py-3 pl-4 pr-3">
      <View
        accessible
        accessibilityLabel={`Teklif ücreti ${feeLabel ?? 'hesaplanıyor'}`}
        className="flex-1 flex-row items-baseline gap-2"
      >
        <Text className="text-badge text-accent-soft-fg">Teklif ücreti</Text>
        <Text variant="number" color="onAccentSoft">
          {feeLabel ?? '—'}
        </Text>
      </View>
      {action}
    </View>
  )
}
