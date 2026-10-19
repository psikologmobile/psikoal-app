import { View } from 'react-native'

import type { IconName } from '@/core/components/atoms/Icon'

import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { Float, Shake } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type ErrorBannerProps = {
  /** Kısa hata metni (satır içi kutu). */
  message?: string
  /** Blok görünüm: başlık + açıklama + yüzen ikon + "Tekrar dene". */
  title?: string
  description?: string
  icon?: IconName
  retryLabel?: string
  onRetry?: () => void
  /** Her değiştiğinde yeniden sallanır (ör. deneme sayacı). */
  shakeKey?: unknown
  /** Satır içi kutuda solda uyarı ikonu (Giriş). */
  showIcon?: boolean
  className?: string
}

/**
 * ErrorBanner — danger-soft zemin, danger çizgi, on-danger-soft yazı,
 * `role="alert"` + shake (200 ms gecikme). Giriş/Kayıt hataları, bağlantı
 * hatası, bakiye yetersiz, ret gerekçesi.
 */
export function ErrorBanner({
  message,
  title,
  description,
  icon = 'WifiOff',
  retryLabel = 'Tekrar dene',
  onRetry,
  shakeKey,
  showIcon = false,
  className,
}: ErrorBannerProps) {
  const colors = useThemeColors()
  const block = Boolean(title)
  return (
    <Shake trigger={shakeKey ?? message ?? title} withHaptic>
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        className={cn(
          'border border-danger bg-danger-soft',
          block ? 'items-center gap-2.5 rounded-2xl p-[22px]' : 'rounded-md px-3.5 py-3',
          className
        )}
      >
        {block ? (
          <>
            <Float>
              <Icon name={icon} size={40} color={colors.danger} strokeWidth={1.8} />
            </Float>
            <Text className="text-center font-body-bold text-body-lg text-danger-soft-fg">
              {title}
            </Text>
            {description ? (
              <Text className="text-center text-body-sm text-fg-muted">{description}</Text>
            ) : null}
            {onRetry ? (
              <Button label={retryLabel} onPress={onRetry} variant="outline" size="sm" />
            ) : null}
          </>
        ) : (
          <View className="flex-row items-start gap-2.5">
            {showIcon ? (
              <Icon name="CircleAlert" size={20} color={colors.onDangerSoft} strokeWidth={2.2} />
            ) : null}
            <Text className="flex-1 font-body-semibold text-body-sm text-danger-soft-fg">
              {message}
            </Text>
          </View>
        )}
      </View>
    </Shake>
  )
}
