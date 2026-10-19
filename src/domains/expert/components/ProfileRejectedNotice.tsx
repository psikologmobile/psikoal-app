import { View } from 'react-native'

import { Button } from '@/core/components/atoms/Button'
import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

export type ProfileRejectedNoticeProps = {
  /** Admin gerekçesi (`ExpertDto.rejectionReason`); yoksa genel metin. */
  reason: string | null
  /** "Belgelerimi güncelle" → Mesleki bilgiler ve belgeler. Verilmezse düğme çizilmez. */
  onUpdate?: () => void
  className?: string
  testID?: string
}

/**
 * Uzman profili reddedildi kutusu (danger-soft, alert): "Profilin onaylanmadı." +
 * admin gerekçesi + belgeleri güncelleme çağrısı. Fırsatlar, İlan detayı, Teklif
 * gönder ve Ayarlar aynı kutuyu kullanır.
 */
export function ProfileRejectedNotice({
  reason,
  onUpdate,
  className,
  testID = 'profile-rejected',
}: ProfileRejectedNoticeProps) {
  return (
    <View
      accessibilityRole="alert"
      testID={testID}
      className={cn('gap-2 rounded-xl border border-danger bg-danger-soft px-4 py-3.5', className)}
    >
      <Text className="text-body-sm text-danger-soft-fg">
        <Text className="font-body-bold text-body-sm text-danger-soft-fg">
          Profilin onaylanmadı.
        </Text>{' '}
        Belgelerini güncelleyip tekrar gönderebilirsin.
      </Text>
      {reason ? (
        <Text className="text-body-sm text-danger-soft-fg">
          <Text className="font-body-bold text-body-sm text-danger-soft-fg">Gerekçe: </Text>
          {reason}
        </Text>
      ) : null}
      {onUpdate ? (
        <Button label="Belgelerimi güncelle" size="sm" className="self-start" onPress={onUpdate} />
      ) : null}
    </View>
  )
}
