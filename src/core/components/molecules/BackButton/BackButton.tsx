import { Pressable } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'

import { Icon } from '@/core/components/atoms/Icon'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type BackButtonVariant = 'floating' | 'overlay' | 'inline'

export type BackButtonProps = {
  variant?: BackButtonVariant
  onPress?: () => void
  className?: string
}

const HIT_SLOP = { top: 8, right: 8, bottom: 8, left: 8 }

/** v2: 44 px outline geri dairesi. Başlıklı satır için ScreenHeader kullan. */
export function BackButton({ variant = 'floating', onPress, className }: BackButtonProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const colors = useThemeColors()

  const isAbsolute = variant === 'floating' || variant === 'overlay'
  const arrowColor = variant === 'overlay' ? '#FFFFFF' : colors.text

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel="Geri"
      style={
        isAbsolute ? { position: 'absolute', top: insets.top + 8, left: 16, zIndex: 10 } : undefined
      }
      className={cn(
        'h-11 w-11 items-center justify-center rounded-full',
        variant === 'overlay'
          ? 'bg-black/35 active:bg-black/50'
          : 'border border-border-strong bg-bg active:bg-surface',
        className
      )}
    >
      <Icon name="ChevronLeft" size={22} color={arrowColor} strokeWidth={2.2} />
    </Pressable>
  )
}
