import { View } from 'react-native'

import type { AvatarProps, AvatarSize } from '@/core/components/atoms/Avatar'

import { Avatar } from '@/core/components/atoms/Avatar'
import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

export type AvatarStackProps = {
  avatars: Array<Pick<AvatarProps, 'src' | 'initials' | 'tone'>>
  /** Görünecek en çok avatar; kalanı "+N" olur. */
  max?: number
  size?: AvatarSize
  accessibilityLabel?: string
  className?: string
}

/** AvatarStack — 30 px avatarlar −8 px üst üste, 2 px bg halka. Keşfet · aktif ilan. */
export function AvatarStack({
  avatars,
  max = 4,
  size = 'xs',
  accessibilityLabel,
  className,
}: AvatarStackProps) {
  const visible = avatars.slice(0, max)
  const extra = avatars.length - visible.length
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? `${avatars.length} kişi`}
      className={cn('flex-row items-center', className)}
    >
      {visible.map((a, i) => (
        <View key={i} className={i === 0 ? '' : '-ml-2'}>
          <Avatar {...a} size={size} ring />
        </View>
      ))}
      {extra > 0 ? (
        <View className="-ml-2 h-[30px] min-w-[30px] items-center justify-center rounded-full border-2 border-bg bg-surface px-1.5">
          <Text className="font-body-heavy text-badge text-fg">+{extra}</Text>
        </View>
      ) : null}
    </View>
  )
}
