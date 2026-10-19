import { View } from 'react-native'

import { IconButton } from '@/core/components/atoms/IconButton'
import { Pop } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type PasswordFlowHeaderProps = {
  /** 0 unuttum · 1 e-posta gönderildi · 2 yeni şifre · 3 güncellendi */
  step: 0 | 1 | 2 | 3
  onBack: () => void
}

/** Şifre sıfırlama akışının üst satırı: "Girişe dön" + 4 noktalı ilerleme. */
export function PasswordFlowHeader({ step, onBack }: PasswordFlowHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      <IconButton icon="ChevronLeft" accessibilityLabel="Girişe dön" onPress={onBack} />
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`Adım ${step + 1} / 4`}
        className="flex-row items-center gap-1.5"
      >
        {[0, 1, 2, 3].map((i) =>
          i === step ? (
            <Pop key={i} replayKey={step} duration={500}>
              <View className="h-2 w-6 rounded-full bg-primary" />
            </Pop>
          ) : (
            <View key={i} className={cn('h-2 w-2 rounded-full bg-border-strong')} />
          )
        )}
      </View>
    </View>
  )
}
