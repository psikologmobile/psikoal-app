import { View } from 'react-native'

import { ProgressSegments } from '@/core/components/atoms/ProgressSegments'
import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

export type StrengthMeterProps = {
  /** 0–4 (dolu parça sayısı). Puanı çağıran hesaplar. */
  score: number
  /** "Güçlü · en az 8 karakter" */
  label?: string
  className?: string
}

/** StrengthMeter — 4 parça sıralı dolum + etiket. Kayıt, Şifre. */
export function StrengthMeter({ score, label, className }: StrengthMeterProps) {
  const s = Math.max(0, Math.min(4, score))
  return (
    <View className={cn('flex-row items-center gap-2.5', className)}>
      <ProgressSegments
        total={4}
        current={s}
        variant="thin"
        className="flex-1"
        accessibilityLabel={label ? `Şifre gücü: ${label}` : `Şifre gücü ${s} / 4`}
      />
      {label ? (
        <Text
          className={cn(
            'font-body-bold text-label',
            s >= 3 ? 'text-primary-text' : 'text-fg-muted'
          )}
        >
          {label}
        </Text>
      ) : null}
    </View>
  )
}
