import type { ReactNode } from 'react'

import { Modal, Pressable, View } from 'react-native'

import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import { IconButton } from '@/core/components/atoms/IconButton'
import { Text } from '@/core/components/atoms/Text'
import { usePresence } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type DialogProps = {
  visible: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  actions?: ReactNode
  dismissable?: boolean
  /** Sağ üstte kapat (×) düğmesi. */
  showClose?: boolean
  className?: string
}

/**
 * Dialog (web) — scrim + ortada kart, scale .92→1 + fade (`dialog-in`,
 * 350 ms), en çok 480 px. Web onay ve başarı pencereleri. Mobilde
 * BottomSheet tercih edilir.
 */
export function Dialog({
  visible,
  onClose,
  title,
  description,
  children,
  actions,
  dismissable = true,
  showClose = true,
  className,
}: DialogProps) {
  const { mounted, progress } = usePresence(visible, { duration: 350 })
  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }))
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.92 + 0.08 * progress.value }],
  }))

  if (!mounted) return null

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center p-5">
        <Animated.View
          style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, scrimStyle]}
        >
          <Pressable
            className="flex-1 bg-zinc-950/45 dark:bg-black/60"
            onPress={dismissable ? onClose : undefined}
            accessibilityRole="button"
            accessibilityLabel="Kapat"
          />
        </Animated.View>
        <Animated.View style={[{ width: '100%', maxWidth: 480 }, cardStyle]}>
          <View
            accessibilityViewIsModal
            accessibilityLabel={title}
            className={cn('gap-3.5 rounded-3xl border border-border bg-bg p-6', className)}
          >
            {title || showClose ? (
              <View className="flex-row items-start gap-3">
                {title ? (
                  <Text accessibilityRole="header" variant="sheet" className="flex-1">
                    {title}
                  </Text>
                ) : (
                  <View className="flex-1" />
                )}
                {showClose ? (
                  <IconButton
                    icon="X"
                    accessibilityLabel="Kapat"
                    onPress={onClose}
                    size="sm"
                    variant="ghost"
                  />
                ) : null}
              </View>
            ) : null}
            {description ? (
              <Text variant="body" color="muted">
                {description}
              </Text>
            ) : null}
            {children}
            {actions ? <View className="mt-1.5">{actions}</View> : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}
