import { useState } from 'react'
import type { ReactNode } from 'react'

import { Modal, Pressable, View } from 'react-native'

import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@/core/components/atoms/Text'
import { usePresence } from '@/core/motion'
import { cn } from '@/core/utils/cn'

export type BottomSheetProps = {
  visible: boolean
  onClose: () => void
  title?: string
  description?: string
  /** Gövde (form, liste). */
  children?: ReactNode
  /** Alt eylem satırı (ör. iki sütunlu Vazgeç / Onayla). */
  actions?: ReactNode
  /** Scrim'e dokununca kapanmasın (geri alınamaz işlemlerde). */
  dismissable?: boolean
  className?: string
}

/**
 * BottomSheet — scrim fade (250 ms) + panel aşağıdan (`sheet-up`, 380 ms),
 * üstte 44×5 tutamak, üst köşeler radius 30, bg zemin. Eşleş onayı, ilanı
 * kapat, davet, geri çek, hesap sil/dondur, çıkış.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
  actions,
  dismissable = true,
  className,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets()
  const { mounted, progress } = usePresence(visible, { duration: 380 })
  const [height, setHeight] = useState(600)

  const scrimStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, progress.value * 1.5) }))
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height }],
  }))

  if (!mounted) return null

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
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
        <Animated.View style={sheetStyle} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
          <View
            accessibilityViewIsModal
            accessibilityLabel={title}
            // REASON: alt güvenli alan cihazdan gelir
            style={{ paddingBottom: Math.max(34, insets.bottom + 16) }}
            className={cn(
              'w-full gap-3.5 self-center rounded-t-sheet bg-bg px-[22px] pt-3.5 web:max-w-[560px]',
              className
            )}
          >
            <View className="h-[5px] w-11 self-center rounded-full bg-border-strong" />
            {title ? (
              <Text accessibilityRole="header" variant="sheet" className="mt-2">
                {title}
              </Text>
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
