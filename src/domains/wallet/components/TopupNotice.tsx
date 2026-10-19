import { View } from 'react-native'

import { useRouter } from 'expo-router'

import { isTopupLinkAvailable } from '../utils/walletUtils'
import { TOPUP_WEB_PATH } from '../wallet.constants'

import { Button } from '@/core/components/atoms/Button'
import { Text } from '@/core/components/atoms/Text'
import { Shake } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type TopupNoticeProps = {
  /** Mobilde gösterilen DÜZ metin (bağlantı/düğme/fiyat yok — mağaza kuralı). */
  message: string
  /** Web'de metnin yerine gösterilecek kısa açıklama; verilmezse yalnız düğme. */
  webMessage?: string
  /** muted: bilgi kutusu (surface) · danger: yetersiz bakiye uyarısı (danger-soft, shake) */
  tone?: 'muted' | 'danger'
  /** Web düğmesi etiketi. */
  actionLabel?: string
  className?: string
  testID?: string
}

/**
 * Bakiye yükleme bildirimi. Mobil uygulamada (App Store 3.1.1 / Play) yalnız düz
 * metin; web uygulamasında "Bakiye yükle" → `/bakiye`.
 */
export function TopupNotice({
  message,
  webMessage,
  tone = 'muted',
  actionLabel = 'Bakiye yükle',
  className,
  testID,
}: TopupNoticeProps) {
  const router = useRouter()
  const isDanger = tone === 'danger'
  const web = isTopupLinkAvailable()
  const text = web ? webMessage : message

  const box = (
    <View
      testID={testID}
      accessibilityRole={isDanger ? 'alert' : undefined}
      className={cn(
        'gap-2.5 rounded-xl px-4 py-3.5',
        isDanger ? 'border border-danger bg-danger-soft' : 'bg-surface',
        className
      )}
    >
      {text ? (
        <Text className={cn('text-body-sm', isDanger ? 'text-danger-soft-fg' : 'text-fg-muted')}>
          {text}
        </Text>
      ) : null}
      {web ? (
        <Button
          label={actionLabel}
          size="sm"
          icon="Wallet"
          className="self-start"
          // REASON: /bakiye web yükleme sayfası; typed routes onu tanımıyor.
          onPress={() => router.push(TOPUP_WEB_PATH as never)}
        />
      ) : null}
    </View>
  )

  return isDanger ? <Shake withHaptic>{box}</Shake> : box
}
