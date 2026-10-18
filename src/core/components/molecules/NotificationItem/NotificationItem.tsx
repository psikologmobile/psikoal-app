import { View } from 'react-native'

import type { IconName } from '@/core/components/atoms/Icon'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { PressableScale, PulseDot } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type NotificationItemProps = {
  title: string
  body?: string
  /** Göreli zaman metni backend'den gelir ("2 sa önce"). */
  time: string
  icon: IconName
  /** Yüksek öncelik: ikon kutusu primary dolgu. */
  priority?: 'high' | 'normal'
  unread?: boolean
  onPress?: () => void
  testID?: string
}

/**
 * NotificationItem (kabuk) — tür ikonu (yüksek öncelik primary dolgu), başlık,
 * metin, zaman, okunmamış nabız noktası; okunmamış satır accent-soft zemin.
 */
export function NotificationItem({
  title,
  body,
  time,
  icon,
  priority = 'normal',
  unread = false,
  onPress,
  testID,
}: NotificationItemProps) {
  const colors = useThemeColors()
  const high = priority === 'high'
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      scaleTo={0.98}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${unread ? 'Okunmadı. ' : ''}${title}. ${body ?? ''} ${time}`}
      className={cn('flex-row items-start gap-3 rounded-xl p-3', unread && 'bg-accent-soft')}
    >
      <View
        className={cn(
          'h-11 w-11 items-center justify-center rounded-md',
          high ? 'bg-primary' : 'bg-surface'
        )}
      >
        <Icon
          name={icon}
          size={20}
          strokeWidth={2}
          color={high ? colors.onPrimary : colors.primaryText}
        />
      </View>
      <View className="min-w-0 flex-1 gap-[3px]">
        <Text className="font-body-bold text-body leading-5 text-fg">{title}</Text>
        {body ? <Text className="text-label leading-[18px] text-fg-muted">{body}</Text> : null}
        <Text className="text-xs text-fg-muted">{time}</Text>
      </View>
      {unread ? <PulseDot size={10} className="mt-1.5" /> : null}
    </PressableScale>
  )
}
